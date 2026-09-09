import "server-only";
import type { Airport, PriceCalendarEntry } from "./types";
import { AIRLINES, type AirlineProfile } from "@/data/airlines";
import { getAirport } from "@/data/airports";
import { bearing, distanceMiles, estimateBlockMinutes, tzOffsetMinutes } from "./geo";
import { getFlightProvider } from "./provider";
// The mock network doubles as the site's route knowledge base (which airlines
// fly nonstop, how often, via which hubs). With a live inventory provider these
// facts still come from the curated hub/route data rather than a paid API call
// per page render.
import { isUS, nonstopService, offersCabin } from "./mock/network";
import { addDays, parseDateOnly, toDateOnly } from "@/lib/utils";

/** Lowest fare in a calendar month and the date it falls on. */
export interface MonthFare {
  month: string; // YYYY-MM
  label: string; // "October 2026"
  price: number;
  date: string; // YYYY-MM-DD of the cheapest departure
}

export interface WeekdayFare {
  day: number; // 0 = Sunday
  label: string; // "Tuesday"
  averagePrice: number;
}

export interface RouteAirline {
  airline: AirlineProfile;
  nonstop: boolean;
  flightsPerDay: number;
  /** Hub codes used for one-stop itineraries (empty for nonstop carriers). */
  via: string[];
}

export interface LowestFare {
  price: number;
  date: string;
}

export interface RouteInfo {
  origin: Airport;
  destination: Airport;
  distanceMiles: number;
  typicalDurationMinutes: number;
  isDomestic: boolean;
  nonstopAirlines: AirlineProfile[];
  /** Every carrier serving the route, nonstop first. */
  airlines: RouteAirline[];
  /** Nonstop departures per day, all airlines combined. */
  flightsPerDay: number;
  connectingHubs: string[];
  connectionsByHub: Record<string, string[]>;
  lowestFares: MonthFare[];
  cheapestMonth: MonthFare | null;
  /** Cheapest month entry (same shape as lowestFares items) for the hero card. */
  lowestFare: MonthFare | null;
  weekdayFares: WeekdayFare[];
  cheapestDayOfWeek: string | null;
  priciestDayOfWeek: string | null;
  /** How much cheaper the best weekday is than the worst, in percent. */
  weekdaySavingsPercent: number;
  /** Destination minus origin UTC offset, minutes (positive = destination is ahead). */
  timeZoneDiffMinutes: number;
  advanceBookingTip: string;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function monthKeys(count: number): string[] {
  const now = new Date();
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1));
    out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

/** Airlines with a scheduled nonstop between two airports (economy). */
export function nonstopCarriers(origin: Airport, destination: Airport): AirlineProfile[] {
  const domestic = isUS(origin) && isUS(destination);
  return AIRLINES.filter((al) => offersCabin(al, "economy") && (!domestic || al.countryCode === "US") && nonstopService(al, origin, destination) !== null);
}

const calendarCache = new Map<string, { at: number; entries: PriceCalendarEntry[] }>();
const CAL_TTL = 6 * 60 * 60_000;

async function monthCalendar(origin: string, destination: string, month: string): Promise<PriceCalendarEntry[]> {
  const key = `${origin}:${destination}:${month}`;
  const hit = calendarCache.get(key);
  if (hit && Date.now() - hit.at < CAL_TTL) return hit.entries;
  let entries: PriceCalendarEntry[] = [];
  try {
    entries = await getFlightProvider().priceCalendar(origin, destination, month, "economy");
  } catch {
    entries = [];
  }
  calendarCache.set(key, { at: Date.now(), entries });
  return entries;
}

/** Lowest round-trip fare per traveler over the next ~90 days on a route. */
export async function lowestRouteFare(origin: string, destination: string, days = 90): Promise<LowestFare | null> {
  if (!getAirport(origin) || !getAirport(destination) || origin === destination) return null;
  const today = toDateOnly(new Date());
  const from = addDays(today, 3);
  const to = addDays(today, days);
  let best: PriceCalendarEntry | null = null;
  for (const month of monthKeys(Math.ceil(days / 28) + 1)) {
    for (const e of await monthCalendar(origin, destination, month)) {
      if (e.date < from || e.date > to) continue;
      if (!best || e.price < best.price) best = e;
    }
  }
  return best ? { price: best.price, date: best.date } : null;
}

const infoCache = new Map<string, { at: number; value: RouteInfo }>();
const INFO_TTL = 6 * 60 * 60_000;

/** Everything a route page needs, computed from the datasets plus cached fare calendars. */
export async function describeRoute(originIata: string, destinationIata: string): Promise<RouteInfo | null> {
  const key = `${originIata}-${destinationIata}`;
  const hit = infoCache.get(key);
  if (hit && Date.now() - hit.at < INFO_TTL) return hit.value;

  const origin = getAirport(originIata);
  const destination = getAirport(destinationIata);
  if (!origin || !destination || origin.iata === destination.iata) return null;

  const dist = distanceMiles(origin, destination);
  const isDomestic = isUS(origin) && isUS(destination);
  const nonstopAirlines: AirlineProfile[] = [];
  const airlines: RouteAirline[] = [];
  const connectionsByHub: Record<string, string[]> = {};
  let flightsPerDay = 0;

  for (const al of AIRLINES) {
    if (!offersCabin(al, "economy")) continue;
    if (isDomestic && al.countryCode !== "US") continue;
    const svc = nonstopService(al, origin, destination);
    if (svc) {
      nonstopAirlines.push(al);
      flightsPerDay += svc.flightsPerDay;
      airlines.push({ airline: al, nonstop: true, flightsPerDay: svc.flightsPerDay, via: [] });
      continue;
    }
    const via: string[] = [];
    for (const h of al.hubs) {
      if (h === origin.iata || h === destination.iata) continue;
      const hub = getAirport(h);
      if (!hub) continue;
      if ((distanceMiles(origin, hub) + distanceMiles(hub, destination)) / dist > 1.6) continue;
      if (nonstopService(al, origin, hub) && nonstopService(al, hub, destination)) {
        via.push(h);
        (connectionsByHub[h] ??= []).push(al.iata);
      }
    }
    if (via.length) airlines.push({ airline: al, nonstop: false, flightsPerDay: 0, via });
  }
  airlines.sort((a, b) => Number(b.nonstop) - Number(a.nonstop) || b.flightsPerDay - a.flightsPerDay || a.airline.name.localeCompare(b.airline.name));
  const connectingHubs = Object.entries(connectionsByHub)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5)
    .map(([h]) => h);

  const lowestFares: MonthFare[] = [];
  const dayTotals = new Map<number, { sum: number; n: number }>();
  const today = toDateOnly(new Date());
  const months = monthKeys(6);
  for (const [i, month] of months.entries()) {
    const entries = (await monthCalendar(origin.iata, destination.iata, month)).filter((e) => e.date >= addDays(today, 2));
    if (!entries.length) continue;
    const min = entries.reduce((a, b) => (b.price < a.price ? b : a));
    lowestFares.push({ month, label: monthLabel(month), price: min.price, date: min.date });
    if (i < 3) {
      for (const e of entries) {
        const dow = parseDateOnly(e.date).getDay();
        const t = dayTotals.get(dow) ?? { sum: 0, n: 0 };
        t.sum += e.price;
        t.n += 1;
        dayTotals.set(dow, t);
      }
    }
  }
  const cheapestMonth = lowestFares.length ? lowestFares.reduce((a, b) => (b.price < a.price ? b : a)) : null;
  const lowestFare = cheapestMonth;

  const weekdayFares: WeekdayFare[] = Array.from(dayTotals.entries())
    .map(([day, t]) => ({ day, label: DAY_NAMES[day], averagePrice: Math.round(t.sum / t.n) }))
    .sort((a, b) => a.day - b.day);
  let cheapestDayOfWeek: string | null = null;
  let priciestDayOfWeek: string | null = null;
  let weekdaySavingsPercent = 0;
  if (weekdayFares.length) {
    const cheapest = weekdayFares.reduce((a, b) => (b.averagePrice < a.averagePrice ? b : a));
    const priciest = weekdayFares.reduce((a, b) => (b.averagePrice > a.averagePrice ? b : a));
    cheapestDayOfWeek = cheapest.label;
    priciestDayOfWeek = priciest.label;
    weekdaySavingsPercent = priciest.averagePrice > 0 ? Math.round(((priciest.averagePrice - cheapest.averagePrice) / priciest.averagePrice) * 100) : 0;
  }

  const now = Date.now();
  const timeZoneDiffMinutes = tzOffsetMinutes(now, destination.tz) - tzOffsetMinutes(now, origin.tz);

  const value: RouteInfo = {
    origin,
    destination,
    distanceMiles: Math.round(dist),
    typicalDurationMinutes: estimateBlockMinutes(dist, bearing(origin, destination)),
    isDomestic,
    nonstopAirlines,
    airlines,
    flightsPerDay,
    connectingHubs,
    connectionsByHub,
    lowestFares,
    cheapestMonth,
    lowestFare,
    weekdayFares,
    cheapestDayOfWeek,
    priciestDayOfWeek,
    weekdaySavingsPercent,
    timeZoneDiffMinutes,
    advanceBookingTip: isDomestic
      ? "Fares on this route are usually lowest 4 to 8 weeks before departure and rise sharply inside two weeks."
      : dist > 4000
        ? "Book 2 to 5 months ahead for the best fares; long-haul seats sell out earliest for summer and holiday travel."
        : "Book 6 to 12 weeks ahead; fares climb in the last three weeks and around holidays.",
  };
  infoCache.set(key, { at: Date.now(), value });
  return value;
}

/** A search deep link for the cheapest day in a month, with a 7-night return. */
export function sampleTripForMonth(month: string): { depart: string; ret: string } {
  const today = toDateOnly(new Date());
  const [y, m] = month.split("-").map(Number);
  let depart = `${y}-${String(m).padStart(2, "0")}-15`;
  if (depart < addDays(today, 3)) depart = addDays(today, 7);
  return { depart, ret: addDays(depart, 7) };
}

export function sizeLabel(size: number): string {
  return { 5: "Major international hub", 4: "Large hub", 3: "Medium airport", 2: "Small airport", 1: "Regional airport" }[size] ?? "Airport";
}
