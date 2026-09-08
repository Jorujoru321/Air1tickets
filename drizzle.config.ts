import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL ?? "file:./data/air1.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

export default defineConfig({
  dialect: authToken ? "turso" : "sqlite",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: authToken ? { url, authToken } : { url },
  strict: true,
  verbose: true,
});
