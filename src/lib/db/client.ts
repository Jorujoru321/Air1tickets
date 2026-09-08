import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { MIGRATIONS } from "./migrations";

export type Db = LibSQLDatabase<typeof schema>;

interface Global {
  __air1Db?: { client: Client; db: Db; migrated: Promise<void> };
}
const g = globalThis as unknown as Global;

function resolveUrl(): string {
  const url = process.env.DATABASE_URL?.trim() || "file:./data/air1.db";
  if (url.startsWith("file:")) {
    const rel = url.slice("file:".length);
    const abs = path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    return `file:${abs}`;
  }
  return url;
}

async function runMigrations(client: Client) {
  await client.execute(`CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')))`);
  const applied = new Set((await client.execute(`SELECT id FROM _migrations`)).rows.map((r) => String(r.id)));
  for (const m of MIGRATIONS) {
    if (applied.has(m.id)) continue;
    for (const statement of m.statements) await client.execute(statement);
    await client.execute({ sql: `INSERT INTO _migrations (id) VALUES (?)`, args: [m.id] });
  }
}

function init() {
  if (g.__air1Db) return g.__air1Db;
  const client = createClient({ url: resolveUrl(), authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
  const db = drizzle(client, { schema });
  const migrated = runMigrations(client).catch((e) => {
    console.error("[air1] database migration failed", e);
    throw e;
  });
  g.__air1Db = { client, db, migrated };
  return g.__air1Db;
}

/** Drizzle database instance; resolves once migrations have been applied. */
export async function getDb(): Promise<Db> {
  const inst = init();
  await inst.migrated;
  return inst.db;
}

export { schema };
