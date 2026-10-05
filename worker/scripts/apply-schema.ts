// Usage: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... bun scripts/apply-schema.ts
import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";

const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });
await db.executeMultiple(readFileSync(new URL("../schema.sql", import.meta.url), "utf8"));
console.log("Schema applied.");
