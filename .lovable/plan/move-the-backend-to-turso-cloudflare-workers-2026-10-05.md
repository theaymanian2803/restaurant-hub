# Move the backend to Turso + Cloudflare Workers

## What changes for you
- All data (menu, categories, orders, reservations, landing content, users) lives in Turso.
- A new server on Cloudflare Workers sits between the website and Turso. Your Turso link and token stay on that server only.
- Sign-in becomes our own email + password system. Google sign-in is removed for now. It can come back later, but you'd need to set up your own Google app.
- Order tracking checks for updates every 5 seconds instead of updating instantly.
- Image uploads keep going to your Cloudflare R2, now through the same Worker.
- Your existing data is copied over with a one-time script once Turso is connected.

## What you'll provide at the end
- Turso database URL and auth token.
- A Cloudflare account to deploy the Worker to (a single deploy command). I can't deploy it to your Cloudflare account from here.
- Existing users will need to reset their password, since the current passwords can't be exported.

## Technical details

```text
React app  --fetch + JWT-->  Cloudflare Worker (Hono)  -->  Turso (libSQL)
                                     |
                                     +--> R2 bucket (binding)
```

- `worker/` folder: Hono app, `@libsql/client/web`, `wrangler.toml`, R2 binding.
  Secrets: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `JWT_SECRET`.
- `worker/schema.sql`: SQLite tables mirroring the current ones, plus `users` (email, password hash with PBKDF2 via WebCrypto) and `user_roles`.
- Auth: `POST /auth/signup`, `/auth/login`, `GET /auth/me`. Signed JWT (HS256) returned to the client and sent as a Bearer token. Admin role is checked on the server for every admin route; nothing role-related is trusted from the browser.
- REST routes: categories, menu-items, reservations, orders (+ items, status), landing/:key, profile, upload. Each route enforces the same rules the current access policies do (owner or admin).
- Input validated with zod in the Worker.
- Frontend: new `src/lib/api.ts` client (base URL from `VITE_API_URL`), new `useAuth` built on it, all pages/admin screens/landing helpers switched from the current backend client to `api.ts`. Order pages poll every 5s.
- `worker/scripts/migrate.ts`: reads current data with existing access and inserts it into Turso, keeping ids. Users are created with no password and must use reset.
- Password reset: admin-issued reset link for now (no email sending set up yet).
- The current backend stays in place until you confirm the switch works, then the old client code is removed.
