import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { getDb, schema } from "@/lib/db/client";
import { isValidReference, normalizeReference } from "@/lib/booking/reference";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";
import { sendPlainEmail } from "@/lib/email/send";
import { site } from "@/lib/site";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  topic: z.enum(["existing", "new", "refund", "website", "partnership", "other"]),
  reference: z.string().trim().max(12).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a little more").max(5000),
  website: z.string().max(200).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const rl = rateLimit(`contact:${clientIp(req)}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const d = parsed.data;
  // Honeypot filled → pretend success, store nothing.
  if (d.website) return NextResponse.json({ ok: true });
  const reference = d.reference ? normalizeReference(d.reference) : "";
  if (reference && !isValidReference(reference)) return NextResponse.json({ error: "Booking references look like A1K7M2QX." }, { status: 400 });
  const db = await getDb();
  await db.insert(schema.contactMessages).values({ id: `msg_${nanoid(14)}`, name: d.name, email: d.email, topic: d.topic, bookingReference: reference || null, message: d.message });
  // Best-effort notifications (logged to console when email isn't configured).
  void sendPlainEmail(site.supportEmail, `[Contact] ${d.topic}${reference ? ` · ${reference}` : ""} — ${d.name}`, `From: ${d.name} <${d.email}>\nTopic: ${d.topic}\nReference: ${reference || "—"}\n\n${d.message}`).catch(() => {});
  void sendPlainEmail(d.email, `We received your message — ${site.name}`, `Hi ${d.name.split(" ")[0]},\n\nThanks for contacting ${site.name}. We'll reply to this email address within a few hours.\n\nYour message:\n${d.message}\n\nFor urgent same-day travel issues call ${site.supportPhone} (24/7).`).catch(() => {});
  return NextResponse.json({ ok: true }, { status: 201 });
}
