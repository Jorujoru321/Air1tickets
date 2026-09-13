import "server-only";
import type { CabinClass, PriceCalendarEntry } from "./types";
import { getFlightProvider } from "./provider";
import { getAirport } from "@/data/airports";
import { getRoutesFrom } from "@/data/routes";
import { addDays, toDateOnly } from "@/lib/utils";
import type { RouteCategory } from "@/data/types";

export interface LowestFare {
  origin: string;
  destination: string;
  price: number;
  date: string;
}

/** Month keys ("YYYY-MM") covering today → today + days. */
function monthsAhead(days: number): string[] {
  const out: string[] = [];
  const today = new Date();
  const end = new Date(today.getTime() + days * 86_400_000);
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  while (cursor <= end) {
    out.push(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return out;
}

/** Lowest round-trip fare per traveler on a route within the next `days` days (provider calendar, cached by the provider). */
export async function lowestFare(origin: string, destination: string, days = 60, cabin: CabinClass = "economy"): Promise<LowestFare | null> {
  if (!getAirport(origin) || !getAirport(destination) || origin === destination) return null;
  const provider = getFlightProvider();
  const today = toDateOnly(new Date());
  const last = addDays(today, days);
  let best: PriceCalendarEntry | null = null;
  for (const month of monthsAhead(days)) {
    let entries: PriceCalendarEntry[] = [];
    try {
      entries = await provider.priceCalendar(origin, destination, month, cabin);
    } catch {
      continue;
    }
    for (const e of entries) {
      if (e.date < addDays(today, 3) || e.date > last) continue;
      if (!best || e.price < best.price) best = e;
    }
  }
  return best ? { origin, destination, price: best.price, date: best.date } : null;
}

export interface Deal extends LowestFare {
  /** Suggested 7-night return date for deep links. */
  returnDate: string;
  category: RouteCategory;
}

/** Best deals departing an origin over the next `days` days, cheapest first. */
export async function dealsFrom(origin: string, limit = 12, days = 90): Promise<Deal[]> {
  const routes = getRoutesFrom(origin);
  const results = await Promise.all(
    routes.map(async (r) => {
      const fare = await lowestFare(r.origin, r.destination, days);
      return fare ? ({ ...fare, returnDate: addDays(fare.date, 7), category: r.category } satisfies Deal) : null;
    }),
  );
  return results
    .filter((d): d is Deal => d !== null)
    .sort((a, b) => a.price - b.price)
    .slice(0, limit);
}
