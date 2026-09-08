import "server-only";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb, schema } from "@/lib/db/client";
import { hashPassword, verifyPassword } from "./password";
import type { User } from "@/lib/db/schema";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const rows = await db.select().from(schema.users).where(eq(schema.users.email, normalizeEmail(email))).limit(1);
  return rows[0] ?? null;
}

export async function createUser(input: { email: string; password: string; firstName: string; lastName: string; phone?: string; newsletter?: boolean }): Promise<User> {
  const db = await getDb();
  const id = `usr_${nanoid(16)}`;
  const passwordHash = await hashPassword(input.password);
  await db.insert(schema.users).values({
    id,
    email: normalizeEmail(input.email),
    passwordHash,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    phone: input.phone?.trim() || null,
    newsletter: Boolean(input.newsletter),
  });
  const rows = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  return rows[0];
}

export async function authenticate(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user) {
    // Constant-ish time: hash anyway to blunt user-enumeration timing.
    await verifyPassword(password, "$2a$11$abcdefghijklmnopqrstuuAbCdEfGhIjKlMnOpQrStUvWxYz012345");
    return null;
  }
  const ok = await verifyPassword(password, user.passwordHash);
  return ok ? user : null;
}
