import { NextResponse } from "next/server";
import { z } from "zod";
import { getFlightProvider } from "@/lib/flights/provider";
import { createFareLock } from "@/lib/leads/service";
import { offerChatText, whatsappLink, messengerLink } from "@/lib/leads/chat-links";
import { getCurrentUser } from "@/lib/auth/current-user";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  offerId: z.string().min(4).max(2000),
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  phone: z
    .string()
    .trim()
    .min(7, "Enter your phone number")
    .max(25)
    .refine((v) => /^[+\d][\d\s().-]{6,}$/.test(v), "Enter a valid phone number"),
  channel: z.enum(["whatsapp", "messenger", "call", "sms", "email"]),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  source: z.string().trim().max(40).optional(),
  /** Honeypot: humans never see this field. */
  company: z.string().max(200).optional().or(z.literal("")),
});

/**
 * POST /api/price-locks — lock the fare a traveler is looking at and create a
 * lead for the agents. No payment is taken; the offer is re-fetched server-side
 * so the locked price is what the site actually showed.
 */
export async function POST(req: Request) {
  const rl = rateLimit(`lock:${clientIp(req)}`, { limit: 8, windowMs: 10 * 60_000 });
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const d = parsed.data;
  if (d.company) return NextResponse.json({ ok: true, reference: "L-000000" });

  const offer = await getFlightProvider().getOffer(d.offerId);
  if (!offer) return NextResponse.json({ error: "This fare is no longer available. Please search again and lock a current fare." }, { status: 410 });

  const user = await getCurrentUser();
  const lock = await createFareLock({ offer, name: d.name, email: d.email, phone: d.phone, channel: d.channel, notes: d.notes || undefined, source: d.source, userId: user?.id ?? null });
  return NextResponse.json(
    {
      ok: true,
      reference: lock.reference,
      lockedPrice: lock.lockedPrice,
      expiresAt: lock.expiresAt,
      responseMinutes: site.priceLock.responseMinutes,
      whatsapp: whatsappLink(offerChatText(offer, lock.reference)),
      messenger: messengerLink(lock.reference),
    },
    { status: 201 },
  );
}
