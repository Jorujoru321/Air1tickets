import { NextResponse } from "next/server";
import { searchAirports } from "@/data/airports";

/** GET /api/airports?q=new+york → up to 10 matching airports. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").slice(0, 60);
  const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit") ?? 10) || 10));
  const airports = searchAirports(q, limit).map((a) => ({
    iata: a.iata,
    name: a.name,
    city: a.city,
    state: a.state,
    country: a.country,
    countryCode: a.countryCode,
    metro: a.metro,
  }));
  return NextResponse.json({ query: q, airports }, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
}
