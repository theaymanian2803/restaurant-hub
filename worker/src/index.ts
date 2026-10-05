import { Hono, type Context, type Next } from "hono";
import { cors } from "hono/cors";
import { createClient, type Client, type InValue } from "@libsql/client/web";
import { z } from "zod";
import { hashPassword, verifyPassword, signJwt, verifyJwt, randomToken } from "./auth";

type Env = {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  JWT_SECRET: string;
  ALLOWED_ORIGINS: string;
  R2_PUBLIC_URL: string;
  BUCKET: R2Bucket;
};
type Vars = { db: Client; userId: string | null; email: string | null; isAdmin: boolean };
type C = Context<{ Bindings: Env; Variables: Vars }>;

const app = new Hono<{ Bindings: Env; Variables: Vars }>();
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

app.use("*", (c, next) =>
  cors({
    origin: (o) => (c.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).includes(o) ? o : null),
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  })(c, next),
);

// DB + session on every request
app.use("*", async (c, next) => {
  c.set("db", createClient({ url: c.env.TURSO_DATABASE_URL, authToken: c.env.TURSO_AUTH_TOKEN }));
  c.set("userId", null);
  c.set("email", null);
  c.set("isAdmin", false);
  const h = c.req.header("Authorization");
  if (h?.startsWith("Bearer ")) {
    const p = await verifyJwt(h.slice(7), c.env.JWT_SECRET);
    if (p) {
      c.set("userId", p.sub);
      c.set("email", p.email);
      const r = await c.get("db").execute({
        sql: "SELECT 1 FROM user_roles WHERE user_id = ? AND role = 'admin'",
        args: [p.sub],
      });
      c.set("isAdmin", r.rows.length > 0);
    }
  }
  await next();
});

const requireUser = async (c: C, next: Next) => {
  if (!c.get("userId")) return c.json({ error: "Not signed in" }, 401);
  await next();
};
const requireAdmin = async (c: C, next: Next) => {
  if (!c.get("userId")) return c.json({ error: "Not signed in" }, 401);
  if (!c.get("isAdmin")) return c.json({ error: "Admins only" }, 403);
  await next();
};

const q = async (c: C, sql: string, args: InValue[] = []) => (await c.get("db").execute({ sql, args })).rows;
const parse = async <T extends z.ZodTypeAny>(c: C, schema: T): Promise<z.infer<T>> => {
  const body = await c.req.json().catch(() => ({}));
  const r = schema.safeParse(body);
  if (!r.success) throw new HttpError(400, r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  return r.data;
};
class HttpError extends Error {
  constructor(public status: number, msg: string) { super(msg); }
}
app.onError((err, c) => {
  if (err instanceof HttpError) return c.json({ error: err.message }, err.status as 400);
  console.error(err);
  return c.json({ error: "Server error" }, 500);
});

const boolify = (rows: any[]) => rows.map((r) => ({ ...r, is_available: r.is_available === 1 || r.is_available === true }));

// ---------- Auth ----------
const credSchema = z.object({ email: z.string().trim().email().max(255), password: z.string().min(6).max(128) });

async function sessionFor(c: C, userId: string, email: string) {
  const roles = (await q(c, "SELECT role FROM user_roles WHERE user_id = ?", [userId])).map((r) => r.role as string);
  const [profile] = await q(c, "SELECT full_name, phone FROM profiles WHERE id = ?", [userId]);
  const token = await signJwt({ sub: userId, email }, c.env.JWT_SECRET);
  return { token, user: { id: userId, email, full_name: profile?.full_name ?? "", phone: profile?.phone ?? null }, roles };
}

app.post("/auth/signup", async (c) => {
  const b = await parse(c, credSchema.extend({ full_name: z.string().trim().max(100).optional() }));
  const exists = await q(c, "SELECT id FROM users WHERE email = ?", [b.email]);
  if (exists.length) throw new HttpError(409, "An account with this email already exists");
  const uid = id();
  await c.get("db").batch(
    [
      { sql: "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)", args: [uid, b.email, await hashPassword(b.password)] },
      { sql: "INSERT INTO profiles (id, full_name) VALUES (?, ?)", args: [uid, b.full_name ?? ""] },
      { sql: "INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, 'customer')", args: [id(), uid] },
    ],
    "write",
  );
  return c.json(await sessionFor(c, uid, b.email));
});

app.post("/auth/login", async (c) => {
  const b = await parse(c, credSchema);
  const [u] = await q(c, "SELECT id, email, password_hash FROM users WHERE email = ?", [b.email]);
  if (!u || !(await verifyPassword(b.password, u.password_hash as string | null)))
    throw new HttpError(401, u && !u.password_hash ? "Please reset your password to continue" : "Invalid email or password");
  return c.json(await sessionFor(c, u.id as string, u.email as string));
});

app.get("/auth/me", requireUser, async (c) => c.json(await sessionFor(c, c.get("userId")!, c.get("email")!)));

// Admin creates a one-time reset link for a user (no email sending configured)
app.post("/auth/reset-link", requireAdmin, async (c) => {
  const b = await parse(c, z.object({ email: z.string().trim().email() }));
  const token = randomToken();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
  const r = await c.get("db").execute({
    sql: "UPDATE users SET reset_token = ?, reset_expires_at = ? WHERE email = ?",
    args: [token, expires, b.email],
  });
  if (!r.rowsAffected) throw new HttpError(404, "User not found");
  return c.json({ token, expires_at: expires });
});

app.post("/auth/reset-password", async (c) => {
  const b = await parse(c, z.object({ token: z.string().min(10), password: z.string().min(6).max(128) }));
  const [u] = await q(c, "SELECT id, email, reset_expires_at FROM users WHERE reset_token = ?", [b.token]);
  if (!u || (u.reset_expires_at as string) < now()) throw new HttpError(400, "Reset link is invalid or expired");
  await q(c, "UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires_at = NULL WHERE id = ?", [
    await hashPassword(b.password),
    u.id as string,
  ]);
  return c.json(await sessionFor(c, u.id as string, u.email as string));
});

// ---------- Profile ----------
app.patch("/profile", requireUser, async (c) => {
  const b = await parse(c, z.object({ full_name: z.string().trim().max(100).optional(), phone: z.string().trim().max(30).nullable().optional() }));
  await q(c, "UPDATE profiles SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), updated_at = ? WHERE id = ?", [
    b.full_name ?? null, b.phone ?? null, now(), c.get("userId")!,
  ]);
  return c.json({ ok: true });
});

// ---------- Categories ----------
const catSchema = z.object({ name: z.string().trim().min(1).max(100), sort_order: z.number().int().default(0) });
app.get("/categories", async (c) => c.json(await q(c, "SELECT * FROM categories ORDER BY sort_order, name")));
app.post("/categories", requireAdmin, async (c) => {
  const b = await parse(c, catSchema);
  const cid = id();
  await q(c, "INSERT INTO categories (id, name, sort_order) VALUES (?, ?, ?)", [cid, b.name, b.sort_order]);
  return c.json({ id: cid });
});
app.patch("/categories/:id", requireAdmin, async (c) => {
  const b = await parse(c, catSchema);
  await q(c, "UPDATE categories SET name = ?, sort_order = ? WHERE id = ?", [b.name, b.sort_order, c.req.param("id")]);
  return c.json({ ok: true });
});
app.delete("/categories/:id", requireAdmin, async (c) => {
  await q(c, "DELETE FROM categories WHERE id = ?", [c.req.param("id")]);
  return c.json({ ok: true });
});

// ---------- Menu items ----------
const itemSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).nullable().optional(),
  price: z.number().nonnegative(),
  image_url: z.string().url().max(1000).nullable().optional(),
  category_id: z.string().nullable().optional(),
  is_available: z.boolean().default(true),
});
app.get("/menu-items", async (c) => {
  const all = c.get("isAdmin") && c.req.query("all") === "1";
  return c.json(boolify(await q(c, `SELECT * FROM menu_items ${all ? "" : "WHERE is_available = 1"} ORDER BY name`)));
});
app.post("/menu-items", requireAdmin, async (c) => {
  const b = await parse(c, itemSchema);
  const mid = id();
  await q(c, "INSERT INTO menu_items (id, name, description, price, image_url, category_id, is_available) VALUES (?,?,?,?,?,?,?)", [
    mid, b.name, b.description ?? null, b.price, b.image_url ?? null, b.category_id ?? null, b.is_available ? 1 : 0,
  ]);
  return c.json({ id: mid });
});
app.patch("/menu-items/:id", requireAdmin, async (c) => {
  const b = await parse(c, itemSchema);
  await q(c, "UPDATE menu_items SET name=?, description=?, price=?, image_url=?, category_id=?, is_available=?, updated_at=? WHERE id=?", [
    b.name, b.description ?? null, b.price, b.image_url ?? null, b.category_id ?? null, b.is_available ? 1 : 0, now(), c.req.param("id"),
  ]);
  return c.json({ ok: true });
});
app.delete("/menu-items/:id", requireAdmin, async (c) => {
  await q(c, "DELETE FROM menu_items WHERE id = ?", [c.req.param("id")]);
  return c.json({ ok: true });
});

// ---------- Reservations ----------
const resSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(3).max(30),
  party_size: z.number().int().min(1).max(50),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reservation_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  notes: z.string().trim().max(500).nullable().optional(),
});
app.get("/reservations", requireUser, async (c) => {
  const rows = c.get("isAdmin") && c.req.query("all") === "1"
    ? await q(c, "SELECT * FROM reservations ORDER BY reservation_date, reservation_time")
    : await q(c, "SELECT * FROM reservations WHERE user_id = ? ORDER BY reservation_date DESC", [c.get("userId")!]);
  return c.json(rows);
});
app.post("/reservations", requireUser, async (c) => {
  const b = await parse(c, resSchema);
  const rid = id();
  await q(c, "INSERT INTO reservations (id, user_id, name, email, phone, party_size, reservation_date, reservation_time, notes) VALUES (?,?,?,?,?,?,?,?,?)", [
    rid, c.get("userId")!, b.name, b.email, b.phone, b.party_size, b.reservation_date, b.reservation_time, b.notes ?? null,
  ]);
  return c.json({ id: rid });
});
app.patch("/reservations/:id", requireUser, async (c) => {
  const b = await parse(c, z.object({ status: z.enum(["pending", "confirmed", "cancelled", "completed"]) }));
  const rid = c.req.param("id");
  if (c.get("isAdmin")) {
    await q(c, "UPDATE reservations SET status = ?, updated_at = ? WHERE id = ?", [b.status, now(), rid]);
  } else {
    // customers may only cancel their own pending reservation
    if (b.status !== "cancelled") throw new HttpError(403, "Not allowed");
    const r = await c.get("db").execute({
      sql: "UPDATE reservations SET status = 'cancelled', updated_at = ? WHERE id = ? AND user_id = ? AND status = 'pending'",
      args: [now(), rid, c.get("userId")!],
    });
    if (!r.rowsAffected) throw new HttpError(404, "Reservation not found");
  }
  return c.json({ ok: true });
});
app.delete("/reservations/:id", requireAdmin, async (c) => {
  await q(c, "DELETE FROM reservations WHERE id = ?", [c.req.param("id")]);
  return c.json({ ok: true });
});

// ---------- Orders ----------
async function withItems(c: C, orders: any[]) {
  if (!orders.length) return [];
  const ids = orders.map((o) => o.id as string);
  const items = await q(c, `SELECT * FROM order_items WHERE order_id IN (${ids.map(() => "?").join(",")})`, ids);
  return orders.map((o) => ({ ...o, order_items: items.filter((i) => i.order_id === o.id) }));
}
app.get("/orders", requireUser, async (c) => {
  if (c.get("isAdmin") && c.req.query("all") === "1") {
    const rows = await q(c, `SELECT o.*, p.full_name AS customer_name, p.phone AS customer_phone, u.email AS customer_email
      FROM orders o LEFT JOIN profiles p ON p.id = o.user_id LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC`);
    return c.json(await withItems(c, rows));
  }
  return c.json(await withItems(c, await q(c, "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [c.get("userId")!])));
});
app.post("/orders", requireUser, async (c) => {
  const b = await parse(c, z.object({
    notes: z.string().trim().max(500).nullable().optional(),
    items: z.array(z.object({ menu_item_id: z.string(), quantity: z.number().int().min(1).max(50) })).min(1).max(50),
  }));
  // Prices come from the database, never from the browser
  const ids = b.items.map((i) => i.menu_item_id);
  const menu = await q(c, `SELECT id, name, price FROM menu_items WHERE is_available = 1 AND id IN (${ids.map(() => "?").join(",")})`, ids);
  const lines = b.items.map((i) => {
    const m = menu.find((x) => x.id === i.menu_item_id);
    if (!m) throw new HttpError(400, "One of the items is no longer available");
    return { ...i, name: m.name as string, price: Number(m.price) };
  });
  const total = Math.round(lines.reduce((s, l) => s + l.price * l.quantity, 0) * 100) / 100;
  const oid = id();
  await c.get("db").batch([
    { sql: "INSERT INTO orders (id, user_id, total, notes) VALUES (?,?,?,?)", args: [oid, c.get("userId")!, total, b.notes ?? null] },
    ...lines.map((l) => ({
      sql: "INSERT INTO order_items (id, order_id, menu_item_id, item_name, quantity, unit_price) VALUES (?,?,?,?,?,?)",
      args: [id(), oid, l.menu_item_id, l.name, l.quantity, l.price] as InValue[],
    })),
  ], "write");
  return c.json({ id: oid, total });
});
app.patch("/orders/:id", requireAdmin, async (c) => {
  const b = await parse(c, z.object({ status: z.enum(["pending", "preparing", "ready", "completed", "cancelled"]) }));
  await q(c, "UPDATE orders SET status = ?, updated_at = ? WHERE id = ?", [b.status, now(), c.req.param("id")]);
  return c.json({ ok: true });
});
app.delete("/orders/:id", requireAdmin, async (c) => {
  await q(c, "DELETE FROM orders WHERE id = ?", [c.req.param("id")]);
  return c.json({ ok: true });
});

// ---------- Dashboard ----------
app.get("/stats", requireAdmin, async (c) => {
  const [r] = await q(c, `SELECT
    (SELECT COUNT(*) FROM menu_items) AS items,
    (SELECT COUNT(*) FROM categories) AS categories,
    (SELECT COUNT(*) FROM reservations WHERE status = 'pending') AS reservations,
    (SELECT COUNT(*) FROM orders WHERE status = 'pending') AS orders`);
  return c.json(r);
});

// ---------- Landing content ----------
app.get("/landing/:key", async (c) => {
  const [r] = await q(c, "SELECT content FROM landing_content WHERE section_key = ?", [c.req.param("key")]);
  return c.json(r ? JSON.parse(r.content as string) : {});
});
app.put("/landing/:key", requireAdmin, async (c) => {
  const key = c.req.param("key");
  if (!/^[a-z_]{1,40}$/.test(key)) throw new HttpError(400, "Invalid section");
  const body = await c.req.json();
  await q(c, `INSERT INTO landing_content (id, section_key, content, updated_at) VALUES (?,?,?,?)
    ON CONFLICT(section_key) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`, [
    id(), key, JSON.stringify(body ?? {}), now(),
  ]);
  return c.json({ ok: true });
});

// ---------- Uploads (R2) ----------
const MAX_BYTES = 10 * 1024 * 1024;
app.post("/upload", requireAdmin, async (c) => {
  const form = await c.req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "No file");
  if (!file.type.startsWith("image/")) throw new HttpError(400, "Only images allowed");
  if (file.size > MAX_BYTES) throw new HttpError(400, "File too large (max 10MB)");
  const folder = (form.get("folder") as string) === "landing" ? "landing" : "menu";
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = `${folder}/${id()}.${ext}`;
  await c.env.BUCKET.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  return c.json({ url: `${c.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`, key });
});
app.delete("/upload", requireAdmin, async (c) => {
  const url = c.req.query("url") ?? "";
  const base = c.env.R2_PUBLIC_URL.replace(/\/$/, "") + "/";
  if (url.startsWith(base)) await c.env.BUCKET.delete(url.slice(base.length));
  return c.json({ ok: true });
});

app.get("/", (c) => c.json({ ok: true, service: "saveur-api" }));

export default app;
