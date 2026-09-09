import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb, schema } from "@/lib/db/client";
import { getAirport } from "@/data/airports";
import { getCurrentUser } from "@/lib/auth/current-user";
import { CABIN_CLASSES } from "@/lib/flights/types";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";

const iata = z.string().trim().regex(/^[A-Za-z]{3}$/).transform((s) => s.toUpperCase());
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const schemaBody = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  origin: iata,
  destination: iata,
  departDate: dateOnly,
  returnDate: dateOnly.optional().nullable(),
  cabin: z.string().optional(),
  passengers: z.number().int().min(1).max(9).optional(),
});

/**
 * POST /api/price-alerts — save a fare watch.
 * Alert emails are sent by a scheduled job (see docs/README "Price alerts"), not by this handler.
 */
export async function POST(req: Request) {
  const rl = rateLimit(`alerts:${clientIp(req)}`, { limit: 20, windowMs: 60 * 60_000 });
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  const parsed = schemaBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const d = parsed.data;
  if (d.origin === d.destination) return NextResponse.json({ error: "Origin and destination must differ." }, { status: 400 });
  if (!getAirport(d.origin) || !getAirport(d.destination)) return NextResponse.json({ error: "Unknown airport code." }, { status: 400 });
  if (d.returnDate && d.returnDate < d.departDate) return NextResponse.json({ error: "Return date must be after departure." }, { status: 400 });
  const user = await getCurrentUser();
  const db = await getDb();
  await db.insert(schema.priceAlerts).values({
    id: `alr_${nanoid(14)}`,
    email: d.email,
    userId: user?.id ?? null,
    origin: d.origin,
    destination: d.destination,
    departDate: d.departDate,
    returnDate: d.returnDate ?? null,
    cabin: CABIN_CLASSES.includes(d.cabin as (typeof CABIN_CLASSES)[number]) ? (d.cabin as string) : "economy",
    passengers: d.passengers ?? 1,
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}

/** DELETE /api/price-alerts?id=… — owner only. */
export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to manage alerts." }, { status: 401 });
  const db = await getDb();
  const rows = await db.select().from(schema.priceAlerts).where(eq(schema.priceAlerts.id, id)).limit(1);
  const alert = rows[0];
  if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (alert.userId !== user.id && alert.email !== user.email.toLowerCase()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await db.delete(schema.priceAlerts).where(and(eq(schema.priceAlerts.id, id)));
  return NextResponse.json({ ok: true });
}
