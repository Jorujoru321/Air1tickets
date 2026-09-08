import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { getDb, schema } from "@/lib/db/client";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  source: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid email" }, { status: 400 });
  }
  const db = await getDb();
  await db
    .insert(schema.newsletterSubscribers)
    .values({ id: `nl_${nanoid(14)}`, email: parsed.data.email, source: parsed.data.source ?? null })
    .onConflictDoNothing();
  return NextResponse.json({ ok: true });
}
