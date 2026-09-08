/**
 * Geography and timezone helpers used by the mock engine and the UI.
 * No external dependencies — timezone maths uses Intl.
 */
import type { Airport } from "./types";

const EARTH_RADIUS_MI = 3958.8;

export function distanceMiles(a: Pick<Airport, "lat" | "lon">, b: Pick<Airport, "lat" | "lon">): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.min(1, Math.sqrt(h)));
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatter(tz: string): Intl.DateTimeFormat {
  let f = formatterCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatterCache.set(tz, f);
  }
  return f;
}

interface Parts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function partsIn(utcMs: number, tz: string): Parts {
  const parts = formatter(tz).formatToParts(new Date(utcMs));
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour") % 24,
    minute: get("minute"),
    second: get("second"),
  };
}

/** Offset of `tz` from UTC in minutes at the given instant (positive east of UTC). */
export function tzOffsetMinutes(utcMs: number, tz: string): number {
  const p = partsIn(utcMs, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(utcMs / 1000) * 1000) / 60_000);
}

/** Parse a local wall-clock ISO string ("2026-10-12T07:45") in `tz` into a UTC epoch (ms). */
export function localToUtc(local: string, tz: string): number {
  const [datePart, timePart = "00:00"] = local.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const offset1 = tzOffsetMinutes(guess, tz);
  let utc = guess - offset1 * 60_000;
  const offset2 = tzOffsetMinutes(utc, tz);
  if (offset2 !== offset1) utc = guess - offset2 * 60_000;
  return utc;
}

/** Format a UTC epoch (ms) as a local wall-clock ISO string in `tz` ("2026-10-12T07:45"). */
export function utcToLocal(utcMs: number, tz: string): string {
  const p = partsIn(utcMs, tz);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** Minutes between two local ISO strings in their respective zones. */
export function minutesBetween(fromLocal: string, fromTz: string, toLocal: string, toTz: string): number {
  return Math.round((localToUtc(toLocal, toTz) - localToUtc(fromLocal, fromTz)) / 60_000);
}

/** Day offset between two local ISO strings ("...T23:10" → next day "...T06:05" = 1). */
export function dayOffset(fromLocal: string, toLocal: string): number {
  const a = fromLocal.slice(0, 10);
  const b = toLocal.slice(0, 10);
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/** Compass bearing in degrees from a to b. */
export function bearing(a: Pick<Airport, "lat" | "lon">, b: Pick<Airport, "lat" | "lon">): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δλ = toRad(b.lon - a.lon);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * Realistic block time in minutes for a great-circle distance, including taxi.
 * Eastbound long-haul flights benefit from the jet stream; westbound pay for it.
 */
export function estimateBlockMinutes(distMiles: number, bearingDeg?: number): number {
  const speedMiPerMin = distMiles < 600 ? 7.0 : distMiles < 2500 ? 8.1 : 8.7;
  let minutes = 24 + distMiles / speedMiPerMin;
  if (bearingDeg !== undefined && distMiles > 900) {
    const east = Math.cos(((bearingDeg - 90) * Math.PI) / 180); // +1 east, -1 west
    minutes *= 1 - 0.055 * east;
  }
  return Math.round(minutes / 5) * 5;
}
