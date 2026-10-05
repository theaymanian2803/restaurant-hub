# Saveur API (Cloudflare Worker + Turso)

## Setup
```bash
cd worker
bun install && bun add -d postgres   # postgres only needed for the data copy
# 1. Create tables in Turso
TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... bun run db:schema
# 2. Copy existing data
SOURCE_DB_URL=postgres://... TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... bun run db:migrate
# 3. Configure wrangler.toml (bucket_name, R2_PUBLIC_URL, ALLOWED_ORIGINS), then secrets
npx wrangler secret put TURSO_DATABASE_URL
npx wrangler secret put TURSO_AUTH_TOKEN
npx wrangler secret put JWT_SECRET      # any long random string
# 4. Deploy
npx wrangler deploy
```
Then set the site's `VITE_API_URL` to the Worker URL.

## Endpoints
| Method | Path | Access |
|---|---|---|
| POST | /auth/signup, /auth/login, /auth/reset-password | public |
| GET | /auth/me | signed in |
| POST | /auth/reset-link | admin |
| PATCH | /profile | signed in |
| GET | /categories, /menu-items, /landing/:key | public (`?all=1` on menu for admins) |
| POST/PATCH/DELETE | /categories, /menu-items | admin |
| GET/POST | /reservations, /orders | own rows (`?all=1` for admins) |
| PATCH | /reservations/:id | admin, or owner cancelling a pending one |
| PATCH/DELETE | /orders/:id, DELETE /reservations/:id | admin |
| PUT | /landing/:key | admin |
| GET | /stats | admin |
| POST/DELETE | /upload | admin (R2) |

Order totals are computed on the server from database prices.
