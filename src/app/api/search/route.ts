import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { safeParseSearchQuery, type RawQuery } from "@/lib/flights/search-params";
import { getFlightProvider } from "@/lib/flights/provider";
import { getAirport } from "@/data/airports";
import type { SearchParams } from "@/lib/flights/types";
import { getDb, schema } from "@/lib/db/client";

export const dynamic = "force-dynamic";

/** Fire-and-forget analytics row. Never blocks or fails the search. */
export async function logSearch(params: SearchParams, resultCount: number, minPrice?: number) {
  try {
    const db = await getDb();
    await db.insert(schema.searchLog).values({
      id: `srch_${nanoid(14)}`,
      origin: params.origin,
      destination: params.destination,
      departDate: params.departDate,
      returnDate: params.returnDate ?? null,
      cabin: params.cabin,
      passengers: params.passengers.adults + params.passengers.children + params.passengers.infants,
      resultCount,
      minPrice: minPrice ?? null,
    });
  } catch (e) {
    console.warn("[air1] search log failed", (e as Error).message);
  }
}

async function run(raw: RawQuery) {
  const parsed = safeParseSearchQuery(raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { params } = parsed;
  if (!getAirport(params.origin) || !getAirport(params.destination)) return NextResponse.json({ error: "Unknown airport code." }, { status: 404 });
  const offers = await getFlightProvider().search(params);
  void logSearch(params, offers.length, offers[0]?.price.total);
  return NextResponse.json({ params, count: offers.length, offers }, { headers: { "Cache-Control": "private, max-age=120" } });
}

/** GET /api/search?from=JFK&to=LAX&depart=2026-10-12&return=2026-10-19&adults=1&cabin=economy */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  return run(Object.fromEntries(searchParams));
}

/** POST /api/search with the same fields as a JSON body. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const raw: RawQuery = {};
  for (const [k, v] of Object.entries(body)) if (v !== undefined && v !== null) raw[k] = String(v);
  return run(raw);
}
