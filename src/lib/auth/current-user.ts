import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { getSession } from "./session";
import type { User } from "@/lib/db/schema";

export type SafeUser = Omit<User, "passwordHash">;

/** Current signed-in user (memoised per request). */
export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  const session = await getSession();
  if (!session) return null;
  const db = await getDb();
  const rows = await db.select().from(schema.users).where(eq(schema.users.id, session.sub)).limit(1);
  const user = rows[0];
  if (!user) return null;
  const { passwordHash: _ph, ...safe } = user;
  return safe;
});
