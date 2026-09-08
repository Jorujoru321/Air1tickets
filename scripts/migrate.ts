/* Apply schema migrations to the configured database (DATABASE_URL). */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { MIGRATIONS } from "../src/lib/db/migrations";

async function main() {
  let url = process.env.DATABASE_URL?.trim() || "file:./data/air1.db";
  if (url.startsWith("file:")) {
    const rel = url.slice(5);
    const abs = path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    url = `file:${abs}`;
  }
  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
  await client.execute(`CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')))`);
  const applied = new Set((await client.execute(`SELECT id FROM _migrations`)).rows.map((r) => String(r.id)));
  let n = 0;
  for (const m of MIGRATIONS) {
    if (applied.has(m.id)) continue;
    for (const s of m.statements) await client.execute(s);
    await client.execute({ sql: `INSERT INTO _migrations (id) VALUES (?)`, args: [m.id] });
    n++;
  }
  console.log(`[air1] migrations applied: ${n} (database: ${url.replace(/\?.*$/, "")})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
