// Copies existing data from the current backend into Turso, keeping ids.
// Usage:
//   SOURCE_DB_URL=postgres://... TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... bun scripts/migrate.ts
// Alternatively, run it from Lovable (it has access to the current database).
// Migrated users get no password: an admin issues them a reset link (POST /auth/reset-link).
import { createClient, type InValue } from "@libsql/client";
import postgres from "postgres";

const sql = postgres(process.env.SOURCE_DB_URL!, { ssl: "require" });
const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : v);
const norm = (row: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(row).map(([k, v]) => [k, typeof v === "boolean" ? (v ? 1 : 0) : (iso(v) as InValue)]));

async function copy(table: string, query: Promise<Record<string, unknown>[]>, transform = (r: any) => r) {
  const rows = (await query).map((r) => norm(transform(r)));
  if (!rows.length) return console.log(`${table}: 0 rows`);
  const cols = Object.keys(rows[0]);
  await db.batch(
    rows.map((r) => ({
      sql: `INSERT OR REPLACE INTO ${table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`,
      args: cols.map((c) => (r[c] ?? null) as InValue),
    })),
    "write",
  );
  console.log(`${table}: ${rows.length} rows`);
}

await copy("users", sql`select id, email, created_at from auth.users where email is not null`);
await copy("profiles", sql`select id, full_name, phone, created_at, updated_at from public.profiles`);
await copy("user_roles", sql`select id, user_id, role::text as role, created_at from public.user_roles`);
await copy("categories", sql`select id, name, sort_order, created_at from public.categories`);
await copy("menu_items", sql`select id, category_id, name, description, price::float8 as price, image_url, is_available, created_at, updated_at from public.menu_items`);
await copy("reservations", sql`select id, user_id, name, email, phone, party_size, reservation_date::text, reservation_time::text, notes, status::text as status, created_at, updated_at from public.reservations`);
await copy("orders", sql`select id, user_id, total::float8 as total, status::text as status, notes, created_at, updated_at from public.orders`);
await copy("order_items", sql`select id, order_id, menu_item_id, item_name, quantity, unit_price::float8 as unit_price from public.order_items`);
await copy("landing_content", sql`select id, section_key, content::text as content, updated_at from public.landing_content`);

await sql.end();
console.log("Done.");
