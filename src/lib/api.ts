// Client for the Cloudflare Worker API (Turso backend).
// Not wired into pages yet: switch over once VITE_API_URL points to the deployed Worker.
const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const TOKEN_KEY = "saveur_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export async function api<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = tokenStore.get();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let body = init.body;
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(init.json);
  }
  const res = await fetch(`${API_URL}${path}`, { ...init, headers, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

export type ApiSession = {
  token: string;
  user: { id: string; email: string; full_name: string; phone: string | null };
  roles: ("admin" | "customer")[];
};

export const uploadImage = (file: File, folder: "menu" | "landing") => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  return api<{ url: string }>("/upload", { method: "POST", body: fd });
};
