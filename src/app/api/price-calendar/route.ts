import { NextResponse } from "next/server";
import { z } from "zod";
import { getFlightProvider } from "@/lib/flights/provider";
import { getAirport } from "@/data/airports";
import { CABIN_CLASSES, type CabinClass } from "@/lib/flights/types";

const schema = z.object({
  from: z.string().regex(/^[A-Za-z]{3}$/).transform((s) => s.toUpperCase()),
  to: z.string().regex(/^[A-Za-z]{3}$/).transform((s) => s.toUpperCase()),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  cabin: z.string().optional().transform((c) => (CABIN_CLASSES.includes(c as CabinClass) ? (c as CabinClass) : "economy")),
});

/** GET /api/price-calendar?from=JFK&to=LAX&month=2026-10&cabin=economy → lowest round-trip fare per day. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = schema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid query. Expected from, to (IATA) and month (YYYY-MM)." }, { status: 400 });
  const { from, to, month, cabin } = parsed.data;
  if (from === to) return NextResponse.json({ error: "Origin and destination must differ." }, { status: 400 });
  if (!getAirport(from) || !getAirport(to)) return NextResponse.json({ error: "Unknown airport code." }, { status: 404 });
  const [y, m] = month.split("-").map(Number);
  const now = new Date();
  const monthsAhead = (y - now.getUTCFullYear()) * 12 + (m - 1 - now.getUTCMonth());
  if (m < 1 || m > 12 || monthsAhead < 0 || monthsAhead > 11) return NextResponse.json({ error: "Month must be within the next 12 months." }, { status: 400 });
  const entries = await getFlightProvider().priceCalendar(from, to, month, cabin);
  return NextResponse.json(
    { from, to, month, cabin, currency: "USD", entries },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}
