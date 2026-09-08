/**
 * Fare model for the mock engine. Produces plausible 2026 US-market fares that
 * respond to distance, advance purchase, day of week, season, time of day,
 * stops, carrier type and cabin — plus a deterministic per-flight jitter.
 *
 * All functions are pure given their inputs, so an offer can always be
 * re-priced to exactly the same number from its id.
 */
import type { Airport, CabinClass } from "../types";
import type { AirlineProfile } from "@/data/airlines";
import { distanceMiles } from "../geo";
import { daysBetween, parseDateOnly, toDateOnly } from "@/lib/utils";
import { Rng } from "./rng";
import { isUS } from "./network";

const LEISURE_STATES = new Set(["FL", "HI", "NV", "AZ", "PR", "VI"]);
const LEISURE_COUNTRIES = new Set(["MX", "BS", "JM", "DO", "AW", "CW", "SX", "KY", "TC", "BB", "CR", "BZ", "PA"]);
const NEARBY = new Set(["CA", "MX", "BS", "JM", "DO", "AW", "CW", "SX", "KY", "TC", "BB", "TT", "CU", "PA", "CR", "GT", "SV", "BZ", "HN", "BM"]);
const PREMIUM_CARRIERS = new Set(["EK", "QR", "SQ", "CX", "JL", "NH", "EY", "LX", "QF"]);

export function isLeisureDestination(a: Airport): boolean {
  return (a.countryCode === "US" && LEISURE_STATES.has(a.state ?? "")) || LEISURE_COUNTRIES.has(a.countryCode);
}

export function tripKind(a: Airport, b: Airport): "domestic" | "nearby" | "longhaul" {
  if (isUS(a) && isUS(b)) return "domestic";
  if (NEARBY.has(a.countryCode) || NEARBY.has(b.countryCode)) return "nearby";
  return "longhaul";
}

/** Today's date (UTC) as YYYY-MM-DD; overridable for tests. */
export function todayDate(): string {
  return process.env.MOCK_TODAY ?? toDateOnly(new Date());
}

/** Distance-driven base for the cheapest economy fare, one direction, before modifiers. */
export function routeBase(a: Airport, b: Airport): number {
  const dist = distanceMiles(a, b);
  const kind = tripKind(a, b);
  let base = kind === "domestic" ? 44 + 0.087 * dist : kind === "nearby" ? 74 + 0.083 * dist : 138 + 0.068 * dist;
  // Thin, short routes are pricier per mile; very long domestic (Hawaii) slightly cheaper per mile.
  if (dist < 350) base += 18;
  if (dist > 2400 && kind === "domestic") base -= 0.012 * (dist - 2400);
  // Route competition factor (hub-captive markets cost more than competitive trunk routes).
  const key = [a.iata, b.iata].sort().join("-");
  const competition = new Rng(`route:${key}`).range(0.86, 1.16);
  return base * competition;
}

export function advancePurchaseFactor(daysOut: number): number {
  if (daysOut <= 0) return 2.1;
  if (daysOut <= 3) return 1.85;
  if (daysOut <= 7) return 1.52;
  if (daysOut <= 14) return 1.28;
  if (daysOut <= 21) return 1.14;
  if (daysOut <= 45) return 1.0;
  if (daysOut <= 120) return 0.94;
  if (daysOut <= 240) return 0.98;
  return 1.06;
}

export function dayOfWeekFactor(date: string): number {
  const dow = parseDateOnly(date).getDay(); // 0 = Sunday
  switch (dow) {
    case 5:
      return 1.13;
    case 0:
      return 1.1;
    case 4:
      return 1.04;
    case 1:
      return 1.0;
    case 6:
      return 0.96;
    case 2:
      return 0.91;
    case 3:
      return 0.92;
    default:
      return 1;
  }
}

function inWindow(date: string, from: string, to: string): boolean {
  // Compare MM-DD strings; windows crossing the new year handled by caller.
  const md = date.slice(5);
  return md >= from && md <= to;
}

export function seasonFactor(date: string, destination: Airport): number {
  const leisure = isLeisureDestination(destination);
  if (inWindow(date, "11-21", "11-30")) return 1.38; // Thanksgiving
  if (inWindow(date, "12-18", "12-31") || inWindow(date, "01-01", "01-04")) return 1.42; // Christmas / New Year
  if (inWindow(date, "03-06", "04-06")) return leisure ? 1.24 : 1.06; // Spring break
  if (inWindow(date, "06-08", "08-20")) return leisure && destination.countryCode !== "US" ? 1.08 : 1.17; // Summer
  if (inWindow(date, "01-05", "02-12")) return leisure ? 1.06 : 0.86; // January lull
  if (inWindow(date, "09-05", "10-15")) return 0.93; // Shoulder
  return 1.0;
}

export function timeOfDayFactor(departureHHmm: string): number {
  const [h] = departureHHmm.split(":").map(Number);
  if (h < 6 || h >= 22) return 0.86; // red-eye / dawn
  if (h < 7) return 0.93;
  if ((h >= 7 && h < 9) || (h >= 16 && h < 19)) return 1.07; // peak business banks
  if (h >= 12 && h < 15) return 0.97;
  return 1.0;
}

export function stopsFactor(stops: number): number {
  return stops === 0 ? 1 : stops === 1 ? 0.83 : 0.74;
}

export function carrierFactor(al: AirlineProfile): number {
  if (al.lowCost) return al.iata === "WN" ? 0.9 : 0.76;
  if (PREMIUM_CARRIERS.has(al.iata)) return 1.08;
  return 1.0;
}

export function cabinFactor(cabin: CabinClass, kind: "domestic" | "nearby" | "longhaul"): number {
  switch (cabin) {
    case "economy":
      return 1;
    case "premium_economy":
      return kind === "longhaul" ? 1.95 : 1.55;
    case "business":
      return kind === "longhaul" ? 3.7 : kind === "nearby" ? 2.6 : 2.35;
    case "first":
      return kind === "longhaul" ? 5.8 : 2.9;
  }
}

export interface SlicePricingInput {
  origin: Airport;
  destination: Airport;
  date: string;
  cabin: CabinClass;
  airline: AirlineProfile;
  stops: number;
  departureTime: string; // HH:mm
  /** Something unique to this itinerary for stable jitter (e.g. flight signature). */
  signature: string;
  today?: string;
}

/** All-in price per adult for ONE direction (before round-trip discount), cheapest fare brand. */
export function sliceFare(input: SlicePricingInput): number {
  const { origin, destination, date, cabin, airline, stops, departureTime, signature } = input;
  const today = input.today ?? todayDate();
  const kind = tripKind(origin, destination);
  const daysOut = daysBetween(today, date);
  const rng = new Rng(`fare:${signature}:${date}`);
  const jitter = rng.jitter(0.09) * (rng.chance(0.08) ? 1.28 : 1); // occasional "sold-out cheap buckets"
  const raw =
    routeBase(origin, destination) *
    advancePurchaseFactor(daysOut) *
    dayOfWeekFactor(date) *
    seasonFactor(date, destination) *
    timeOfDayFactor(departureTime) *
    stopsFactor(stops) *
    carrierFactor(airline) *
    cabinFactor(cabin, kind) *
    jitter;
  return Math.max(kind === "domestic" ? 39 : 89, raw);
}

export const ROUND_TRIP_FACTOR = 0.86;

/* ───────────────────────────── Taxes & fees ───────────────────────────── */

const FOREIGN_DEPARTURE_TAX: Record<string, number> = {
  GB: 118, DE: 72, FR: 78, NL: 58, BE: 44, IE: 26, ES: 42, PT: 38, IT: 56, GR: 40, CH: 52, AT: 46, DK: 48, SE: 44, NO: 40, FI: 36, IS: 30, CZ: 34, PL: 32, HU: 30, HR: 28, TR: 38,
  JP: 34, KR: 30, CN: 28, HK: 46, TW: 32, SG: 42, TH: 26, MY: 22, PH: 30, ID: 26, IN: 30, VN: 22,
  AU: 62, NZ: 36, FJ: 40, PF: 34,
  AE: 44, QA: 36, IL: 40, JO: 42, EG: 30, MA: 32, ZA: 48, KE: 52, ET: 42, NG: 60, GH: 58,
  CA: 42, MX: 64, BS: 46, JM: 58, DO: 52, AW: 44, CW: 46, SX: 40, KY: 48, TC: 46, BB: 66, TT: 40, CU: 40, PA: 48, CR: 44, GT: 40, SV: 40, BZ: 56, HN: 46, BM: 48,
  CO: 50, PE: 46, EC: 42, BR: 44, CL: 40, AR: 52, UY: 40, VE: 60,
};

export interface TaxBreakdown {
  taxes: number;
  base: number;
}

/**
 * Split an all-in per-passenger fare into base + taxes using realistic US rules.
 * `segments` is the number of flight segments in the slice; `boardingsUS` the number of US enplanements.
 */
export function splitTaxes(
  allIn: number,
  origin: Airport,
  destination: Airport,
  segments: number,
  cabin: CabinClass,
): TaxBreakdown {
  const kind = tripKind(origin, destination);
  let taxes = 0;
  if (kind === "domestic") {
    // 7.5% excise on base, $5.20 per segment, Sept-11 fee $5.60 per one-way, PFC up to $4.50 per boarding.
    const fixed = 5.6 + 5.2 * segments + 4.5 * Math.min(2, segments);
    const base = Math.max(allIn * 0.55, (allIn - fixed) / 1.075);
    taxes = allIn - base;
  } else {
    if (isUS(origin)) taxes += 22.9 + 5.6 + 4.5; // international departure tax, Sept-11 fee, PFC
    if (isUS(destination)) taxes += 22.9 + 7.2 + 7 + 3.83 + 4.5; // arrival tax, customs, immigration, APHIS, PFC
    const foreign = isUS(origin) ? destination : origin;
    let foreignTax = FOREIGN_DEPARTURE_TAX[foreign.countryCode] ?? 45;
    if (!isUS(origin) && foreign.countryCode === "GB" && cabin !== "economy") foreignTax *= 1.9; // UK APD premium band
    taxes += foreignTax;
    // Carrier-imposed surcharge on long-haul (shown as taxes & fees by most OTAs)
    if (kind === "longhaul") taxes += Math.min(allIn * 0.22, 240);
  }
  taxes = Math.min(taxes, allIn * 0.72);
  return { taxes: round2(taxes), base: round2(allIn - taxes) };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Whole-dollar rounding that keeps fares looking like real ones ($218 instead of $217.63). */
export function roundFare(n: number): number {
  return Math.max(1, Math.round(n));
}

/* ─────────────────────────── Ancillary pricing ────────────────────────── */

export function extrasPricing(kind: "domestic" | "nearby" | "longhaul", airline: AirlineProfile) {
  return {
    checkedBagFee: airline.checkedBagFee || (kind === "domestic" ? 35 : 60),
    travelInsurance: kind === "domestic" ? 24 : 39,
    flexibleTicket: kind === "domestic" ? 29 : 49,
    priorityBoarding: 15,
    seatFeeFrom: airline.lowCost ? 12 : 9,
  };
}
