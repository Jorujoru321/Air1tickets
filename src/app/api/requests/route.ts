import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { getDb, schema } from "@/lib/db/client";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const bodySchema = z
  .object({
    kind: z.enum(["flight", "hotel", "activity"]).default("flight"),
    text: z.string().trim().min(5).max(4000),
    origin: z.string().trim().max(80).optional(),
    destination: z.string().trim().max(120).optional(),
    departDate: z.string().trim().max(10).optional(),
    returnDate: z.string().trim().max(10).nullish(),
    checkIn: z.string().trim().max(10).optional(),
    checkOut: z.string().trim().max(10).optional(),
    date: z.string().trim().max(10).optional(),
    travelers: z.number().int().min(1).max(30).optional(),
    passengers: z.object({ adults: z.number().int(), children: z.number().int(), infants: z.number().int() }).optional(),
  })
  .passthrough();

/**
 * POST /api/requests — records a search that was handed off to WhatsApp, so the
 * agency sees demand even when the traveler never presses send in WhatsApp.
 * Fire-and-forget from the client; it always answers 204 so nothing blocks.
 */
export async function POST(req: Request) {
  const rl = rateLimit(`request:${clientIp(req)}`, { limit: 40, windowMs: 10 * 60_000 });
  if (!rl.ok) return new NextResponse(null, { status: 204 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 204 });
  const d = parsed.data;
  const travelers = d.travelers ?? (d.passengers ? d.passengers.adults + d.passengers.children + d.passengers.infants : null);
  try {
    const db = await getDb();
    await db.insert(schema.quoteRequests).values({
      id: `req_${nanoid(14)}`,
      kind: d.kind,
      message: d.text,
      details: JSON.stringify(d),
      origin: d.origin ?? null,
      destination: d.destination ?? null,
      startDate: d.departDate ?? d.checkIn ?? d.date ?? null,
      endDate: d.returnDate ?? d.checkOut ?? null,
      travelers,
      referrer: req.headers.get("referer"),
    });
  } catch (e) {
    console.error("[air1] could not record request", e);
  }
  return new NextResponse(null, { status: 204 });
}
