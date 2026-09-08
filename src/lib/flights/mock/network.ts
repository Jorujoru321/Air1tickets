/**
 * Route network rules for the mock inventory engine.
 *
 * Decides — deterministically — which airlines fly nonstop between two
 * airports, how many times a day, and what the daily timetable looks like.
 * The timetable is keyed by (airline, origin, destination) only, so the same
 * flight numbers and departure times appear every day, like a real schedule.
 */
import type { Airport, CabinClass } from "../types";
import { getAirport } from "@/data/airports";
import { AIRLINES, type AirlineProfile } from "@/data/airlines";
import { bearing, distanceMiles, estimateBlockMinutes, localToUtc, utcToLocal } from "../geo";
import { Rng, hashString } from "./rng";

const US_TERRITORIES = new Set(["US", "PR", "VI", "GU"]);
export function isUS(a: Airport): boolean {
  return US_TERRITORIES.has(a.countryCode);
}

/** Carriers that actually serve Hawaii from the mainland. */
const HAWAII_CARRIERS = new Set(["HA", "AS", "DL", "UA", "AA", "WN"]);
/** Point-to-point leisure carriers that don't sell connections. */
export const POINT_TO_POINT = new Set(["G4", "MX", "SY"]);

const NEARBY_INTL = new Set(["CA", "MX", "BS", "JM", "DO", "AW", "CW", "SX", "KY", "TC", "BB", "TT", "CU", "PA", "CR", "GT", "SV", "BZ", "HN", "BM"]);
function isNearbyInternational(a: Airport): boolean {
  return NEARBY_INTL.has(a.countryCode);
}

/** Continent bucket for plausibility of foreign-carrier legs. */
function continent(a: Airport): string {
  if (isUS(a) || isNearbyInternational(a)) return "NA";
  const c = a.countryCode;
  if (["CO", "PE", "EC", "BR", "CL", "AR", "UY", "VE", "BO", "PY"].includes(c)) return "SA";
  if (["GB", "IE", "FR", "NL", "BE", "DE", "CH", "AT", "ES", "PT", "IT", "GR", "TR", "DK", "SE", "NO", "FI", "IS", "CZ", "PL", "HU", "HR"].includes(c)) return "EU";
  if (["AE", "QA", "IL", "JO", "EG", "MA", "ZA", "KE", "ET", "NG", "GH", "SA"].includes(c)) return "MEA";
  if (["JP", "KR", "CN", "HK", "TW", "SG", "TH", "MY", "PH", "ID", "IN", "VN"].includes(c)) return "AS";
  if (["AU", "NZ", "FJ", "PF"].includes(c)) return "OC";
  return "OTHER";
}

export interface NonstopService {
  airline: AirlineProfile;
  origin: Airport;
  destination: Airport;
  flightsPerDay: number;
  distanceMiles: number;
}

function hubOf(al: AirlineProfile, a: Airport): boolean {
  return al.hubs.includes(a.iata);
}

/**
 * Does `al` operate a nonstop between a and b? Returns the daily frequency or null.
 * Deterministic: uses a hash of (airline, pair) for the "coin flips".
 */
export function nonstopService(al: AirlineProfile, a: Airport, b: Airport): NonstopService | null {
  if (a.iata === b.iata) return null;
  const dist = distanceMiles(a, b);
  if (dist < 95) return null;
  const pairKey = [a.iata, b.iata].sort().join("-");
  const roll = new Rng(`svc:${al.iata}:${pairKey}`).float();
  const aHub = hubOf(al, a);
  const bHub = hubOf(al, b);
  const anyHub = aHub || bHub;
  const usA = isUS(a);
  const usB = isUS(b);
  const alUS = al.countryCode === "US";
  const minSize = Math.min(a.size, b.size);
  const maxSize = Math.max(a.size, b.size);

  const svc = (flightsPerDay: number): NonstopService => ({
    airline: al,
    origin: a,
    destination: b,
    flightsPerDay: Math.max(1, Math.round(flightsPerDay)),
    distanceMiles: dist,
  });

  // ── US carriers flying domestically ─────────────────────────────────────
  if (alUS && usA && usB) {
    const maxRange = al.iata === "HA" ? 5200 : al.lowCost ? 3000 : 5600;
    if (dist > maxRange) return null;
    const hawaii = a.state === "HI" || b.state === "HI";
    if (hawaii && !HAWAII_CARRIERS.has(al.iata)) return null;
    if (hawaii && al.iata === "WN") {
      const mainland = a.state === "HI" ? b : a;
      if (!["CA", "NV", "AZ", "HI"].includes(mainland.state ?? "")) return null;
    }
    // Allegiant links small and mid-size cities with leisure spots; it avoids the mega hubs.
    if (al.iata === "G4" && (a.size === 5 || b.size === 5)) return null;
    if (al.iata === "G4" && !anyHub) return null;
    // Hawaii / Alaska: only large gateways or the carrier's own hubs.
    const longHaulDomestic = dist > 2300;
    if (longHaulDomestic && !(anyHub && minSize >= 3)) return null;
    if (al.iata === "HA") {
      // Hawaiian: HNL/OGG to West Coast + a few big eastern gateways.
      const other = aHub ? b : bHub ? a : null;
      if (!other) return null;
      const ok = other.state === "HI" || ["CA", "WA", "OR", "NV", "AZ"].includes(other.state ?? "") || other.size === 5;
      return ok && roll < 0.8 ? svc(other.state === "HI" ? 8 : 1.5) : null;
    }
    if (anyHub) {
      const other = aHub && bHub ? null : aHub ? b : a;
      if (other === null) return svc(6 + minSize); // hub ↔ hub
      if (al.lowCost) {
        if (other.size >= 4) return svc(3 + (roll < 0.5 ? 1 : 0));
        if (other.size === 3) return roll < 0.75 ? svc(2) : null;
        if (other.size === 2) return roll < 0.35 ? svc(1) : null;
        return roll < 0.12 ? svc(1) : null;
      }
      if (other.size >= 4) return svc(5 + (roll < 0.5 ? 2 : 0));
      if (other.size === 3) return svc(3);
      if (other.size === 2) return roll < 0.9 ? svc(2) : null;
      return roll < 0.6 ? svc(1) : null;
    }
    // Point-to-point (no hub at either end).
    if (al.lowCost) {
      if (minSize >= 3 && roll < 0.4) return svc(minSize >= 4 ? 2 : 1);
      if (al.iata === "G4" && maxSize >= 3 && roll < 0.2) return svc(1); // Allegiant small-city leisure
      return null;
    }
    if (minSize >= 4 && roll < 0.3) return svc(2);
    return null;
  }

  // ── US carriers flying internationally ──────────────────────────────────
  if (alUS && (usA || usB)) {
    const usEnd = usA ? a : b;
    const foreign = usA ? b : a;
    const nearby = isNearbyInternational(foreign);
    if (al.lowCost && !nearby) return null; // ULCCs stay in the Americas
    if (al.iata === "HA") return null;
    if (dist > 8600) return null;
    const usHub = hubOf(al, usEnd);
    if (usHub) {
      if (nearby) {
        if (foreign.size >= 4) return svc(al.lowCost ? 2 : 3);
        if (foreign.size === 3) return roll < 0.6 ? svc(1) : null;
        return roll < 0.25 ? svc(1) : null;
      }
      if (foreign.size === 5) return roll < 0.9 ? svc(usEnd.size === 5 ? 2 : 1) : null;
      if (foreign.size === 4) return roll < 0.55 ? svc(1) : null;
      return null;
    }
    // Non-hub US gateway (e.g. a large city served point-to-point)
    if (nearby && usEnd.size >= 4 && foreign.size >= 4 && roll < 0.45) return svc(1);
    if (!nearby && usEnd.size === 5 && foreign.size === 5 && roll < 0.15) return svc(1);
    return null;
  }

  // ── US carriers between two foreign airports: not offered ───────────────
  if (alUS) return null;

  // ── Foreign carriers ────────────────────────────────────────────────────
  if (!anyHub) return null;
  const hub = aHub ? a : b;
  const other = aHub ? b : a;
  if (dist > 9200) return null;
  if (isUS(other)) {
    // Foreign carrier's hub ↔ US gateway
    const regionalCarrier = ["CA", "MX"].includes(al.countryCode);
    if (regionalCarrier) {
      if (other.size >= 4) return svc(roll < 0.5 ? 3 : 2);
      if (other.size === 3) return roll < 0.55 ? svc(1) : null;
      return roll < 0.2 ? svc(1) : null;
    }
    if (other.size === 5) return roll < 0.85 ? svc(hub.size === 5 ? 2 : 1) : null;
    if (other.size === 4) return roll < 0.5 ? svc(1) : null;
    return null;
  }
  // Foreign hub ↔ foreign airport (used for connections beyond the hub)
  const sameContinent = continent(hub) === continent(other);
  if (hubOf(al, other)) return svc(4);
  if (sameContinent) {
    if (other.size >= 4) return svc(4);
    if (other.size === 3) return roll < 0.85 ? svc(2) : null;
    return roll < 0.5 ? svc(1) : null;
  }
  if (other.size === 5) return roll < 0.7 ? svc(1) : null;
  if (other.size === 4) return roll < 0.4 ? svc(1) : null;
  return null;
}

/** All airlines with a nonstop between two airports. */
export function nonstopServices(a: Airport, b: Airport, cabin: CabinClass): NonstopService[] {
  const out: NonstopService[] = [];
  for (const al of AIRLINES) {
    if (!offersCabin(al, cabin)) continue;
    const s = nonstopService(al, a, b);
    if (s) out.push(s);
  }
  return out;
}

export function offersCabin(al: AirlineProfile, cabin: CabinClass): boolean {
  return al.fareBrands.some((f) => f.cabin === cabin);
}

/* ────────────────────────────── Timetables ────────────────────────────── */

export interface ScheduledFlight {
  airline: AirlineProfile;
  operatingCarrier: string;
  flightNumber: string; // "DL 1234"
  origin: Airport;
  destination: Airport;
  /** "HH:mm" local departure */
  departureTime: string;
  blockMinutes: number;
  distanceMiles: number;
  aircraft: string;
  originTerminal?: string;
  destinationTerminal?: string;
}

export const REGIONAL_PARTNERS: Record<string, { iata: string; name: string; brand: string }[]> = {
  DL: [
    { iata: "OO", name: "SkyWest Airlines", brand: "Delta Connection" },
    { iata: "9E", name: "Endeavor Air", brand: "Delta Connection" },
    { iata: "YX", name: "Republic Airways", brand: "Delta Connection" },
  ],
  AA: [
    { iata: "MQ", name: "Envoy Air", brand: "American Eagle" },
    { iata: "OH", name: "PSA Airlines", brand: "American Eagle" },
    { iata: "PT", name: "Piedmont Airlines", brand: "American Eagle" },
    { iata: "OO", name: "SkyWest Airlines", brand: "American Eagle" },
  ],
  UA: [
    { iata: "OO", name: "SkyWest Airlines", brand: "United Express" },
    { iata: "YV", name: "Mesa Airlines", brand: "United Express" },
    { iata: "G7", name: "GoJet Airlines", brand: "United Express" },
    { iata: "C5", name: "CommuteAir", brand: "United Express" },
  ],
  AS: [
    { iata: "QX", name: "Horizon Air", brand: "Alaska Horizon" },
    { iata: "OO", name: "SkyWest Airlines", brand: "Alaska SkyWest" },
  ],
  AC: [{ iata: "QK", name: "Jazz Aviation", brand: "Air Canada Express" }],
};

export function operatorName(code: string): string | undefined {
  for (const list of Object.values(REGIONAL_PARTNERS)) {
    const hit = list.find((p) => p.iata === code);
    if (hit) return hit.name;
  }
  return undefined;
}

export function operatorBrand(marketing: string, operating: string): string | undefined {
  return REGIONAL_PARTNERS[marketing]?.find((p) => p.iata === operating)?.brand;
}

const NARROW_SHORT = ["Boeing 737-800", "Airbus A320", "Airbus A321", "Boeing 737 MAX 8", "Airbus A320neo"];
const REGIONAL = ["Embraer E175", "Bombardier CRJ900", "Embraer E170", "Bombardier CRJ700"];
const NARROW_LONG = ["Boeing 737 MAX 9", "Airbus A321neo", "Boeing 757-200", "Airbus A321XLR"];
const WIDE = ["Boeing 787-9", "Boeing 777-300ER", "Airbus A350-900", "Airbus A330-300", "Boeing 767-300ER", "Boeing 787-10", "Airbus A330-900neo"];

function pickAircraft(al: AirlineProfile, dist: number, regional: boolean, rng: Rng): string {
  const fleet = al.fleet ?? [];
  const pool = regional
    ? REGIONAL
    : dist < 1600
      ? NARROW_SHORT
      : dist < 3100
        ? NARROW_LONG.concat(NARROW_SHORT.slice(0, 2))
        : WIDE;
  const fromFleet = fleet.filter((f) => pool.some((p) => f.toLowerCase().includes(p.toLowerCase().replace(/^(boeing|airbus|embraer|bombardier) /, ""))));
  if (fromFleet.length && rng.chance(0.85)) return rng.pick(fromFleet);
  return rng.pick(pool);
}

const TERMINALS: Record<string, Record<string, string>> = {
  JFK: { DL: "4", AA: "8", B6: "5", BA: "8", VS: "4", AF: "1", KL: "4", LH: "1", EK: "4", QR: "8", JL: "8", KE: "1", TK: "1", AZ: "1", IB: "8", EI: "7", AY: "8", CX: "8", SQ: "4", EY: "4", LX: "4", OS: "4", TP: "5", NO: "1", default: "4" },
  LAX: { DL: "3", AA: "4", UA: "7", WN: "1", AS: "6", B6: "5", NK: "5", F9: "5", HA: "5", BA: "B", VS: "B", AF: "B", KL: "B", LH: "B", EK: "B", QR: "B", JL: "B", NH: "B", KE: "B", CX: "B", SQ: "B", QF: "B", AM: "2", AC: "6", default: "B" },
  ORD: { UA: "1", AA: "3", DL: "5", WN: "5", NK: "3", F9: "3", B6: "5", AS: "3", default: "5" },
  ATL: { DL: "S", WN: "N", AA: "N", UA: "N", NK: "N", F9: "N", default: "I" },
  DFW: { AA: "A", DL: "E", UA: "E", WN: "E", NK: "E", F9: "E", B6: "E", AS: "E", BA: "D", QR: "D", EK: "D", LH: "D", KE: "D", JL: "D", QF: "D", default: "D" },
  SFO: { UA: "3", AA: "1", DL: "1", WN: "1", AS: "2", B6: "1", F9: "1", HA: "1", default: "I" },
  MIA: { AA: "D", DL: "H", UA: "J", WN: "H", B6: "G", NK: "G", F9: "H", AV: "J", LA: "J", CM: "J", BA: "E", default: "J" },
  EWR: { UA: "C", DL: "B", AA: "A", B6: "A", WN: "B", NK: "B", AS: "A", default: "B" },
  BOS: { DL: "A", B6: "C", AA: "B", UA: "B", WN: "A", AS: "B", NK: "B", F9: "E", default: "E" },
  SEA: { AS: "N", DL: "S", UA: "A", AA: "D", WN: "B", default: "S" },
  DEN: { UA: "B", WN: "C", AA: "A", DL: "A", F9: "A", default: "A" },
  LHR: { BA: "5", AA: "3", DL: "3", VS: "3", UA: "2", AC: "2", LH: "2", SQ: "2", TK: "2", EK: "3", QR: "4", AF: "4", KL: "4", EI: "2", IB: "5", QF: "3", CX: "3", JL: "3", default: "2" },
  CDG: { AF: "2E", DL: "2E", AA: "2A", UA: "1", BA: "2A", KL: "2F", LH: "1", EK: "2C", default: "1" },
  NRT: { NH: "1", UA: "1", DL: "1", JL: "2", AA: "2", BA: "2", default: "1" },
  HND: { JL: "3", NH: "3", DL: "3", AA: "3", UA: "3", default: "3" },
  MEX: { AM: "2", DL: "2", AA: "1", UA: "1", Y4: "1", VB: "1", default: "1" },
  CUN: { AM: "2", DL: "3", AA: "3", UA: "3", WN: "4", B6: "4", NK: "4", F9: "4", default: "3" },
  YYZ: { AC: "1", UA: "1", LH: "1", AA: "3", DL: "3", WS: "3", B6: "3", default: "3" },
  FRA: { LH: "1", UA: "1", AC: "1", AA: "2", DL: "2", default: "2" },
  AMS: { KL: "2", DL: "2", UA: "1", AA: "1", default: "1" },
  MCO: { WN: "A", B6: "A", NK: "A", F9: "A", DL: "B", AA: "B", UA: "B", default: "C" },
  LAS: { WN: "1", NK: "1", F9: "3", DL: "1", AA: "1", UA: "3", AS: "3", B6: "3", default: "3" },
  IAH: { UA: "C", WN: "A", DL: "A", AA: "A", NK: "A", F9: "A", default: "D" },
};

function terminalFor(airport: string, airline: string): string | undefined {
  const t = TERMINALS[airport];
  if (!t) return undefined;
  return t[airline] ?? t.default;
}

/** Deterministic daily timetable for one nonstop service. */
export function timetable(service: NonstopService): ScheduledFlight[] {
  const { airline, origin, destination, flightsPerDay, distanceMiles: dist } = service;
  const rng = new Rng(`tt:${airline.iata}:${origin.iata}:${destination.iata}`);
  const brg = bearing(origin, destination);
  const block = estimateBlockMinutes(dist, brg);
  const flights: ScheduledFlight[] = [];

  // Spread departures between ~05:45 and ~21:30, plus an occasional red-eye for long domestic hauls.
  const windowStart = 5 * 60 + 45;
  const windowEnd = 21 * 60 + 30;
  const slots: number[] = [];
  for (let i = 0; i < flightsPerDay; i++) {
    const frac = flightsPerDay === 1 ? rng.range(0.25, 0.7) : (i + rng.range(0.15, 0.85)) / flightsPerDay;
    slots.push(Math.round((windowStart + frac * (windowEnd - windowStart)) / 5) * 5);
  }
  const eastbound = Math.cos(((brg - 90) * Math.PI) / 180) > 0.3;
  if (dist > 2200 && eastbound && rng.chance(0.6)) slots.push(Math.round(rng.range(21 * 60 + 40, 23 * 60 + 30) / 5) * 5); // red-eye
  if (dist > 3400 && rng.chance(0.5)) slots[0] = Math.round(rng.range(17 * 60, 22 * 60) / 5) * 5; // long-haul evening bank
  slots.sort((x, y) => x - y);

  const regionalAllowed = REGIONAL_PARTNERS[airline.iata] && dist < 900 && Math.min(origin.size, destination.size) <= 3;
  const usedNumbers = new Set<number>();
  for (const minutes of slots) {
    const regional = Boolean(regionalAllowed) && rng.chance(origin.size <= 2 || destination.size <= 2 ? 0.8 : 0.35);
    const partner = regional ? rng.pick(REGIONAL_PARTNERS[airline.iata]) : null;
    let num = regional ? rng.int(3000, 5999) : airline.lowCost ? rng.int(100, 2999) : rng.int(1, 2499);
    while (usedNumbers.has(num)) num += 1;
    usedNumbers.add(num);
    const hh = Math.floor(minutes / 60) % 24;
    const mm = minutes % 60;
    flights.push({
      airline,
      operatingCarrier: partner?.iata ?? airline.iata,
      flightNumber: `${airline.iata} ${num}`,
      origin,
      destination,
      departureTime: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`,
      blockMinutes: block + rng.int(-1, 1) * 5,
      distanceMiles: dist,
      aircraft: pickAircraft(airline, dist, regional, rng),
      originTerminal: terminalFor(origin.iata, airline.iata),
      destinationTerminal: terminalFor(destination.iata, airline.iata),
    });
  }
  return flights;
}

/** Concrete departure/arrival for a scheduled flight on a given date. */
export function flightOnDate(f: ScheduledFlight, date: string): { departure: string; arrival: string; departureUtc: number; arrivalUtc: number } {
  const departure = `${date}T${f.departureTime}`;
  const departureUtc = localToUtc(departure, f.origin.tz);
  const arrivalUtc = departureUtc + f.blockMinutes * 60_000;
  return { departure, arrival: utcToLocal(arrivalUtc, f.destination.tz), departureUtc, arrivalUtc };
}

export function airportOrThrow(iata: string): Airport {
  const a = getAirport(iata);
  if (!a) throw new Error(`Unknown airport ${iata}`);
  return a;
}

/** Stable numeric seed for a search/route/date combination. */
export function seedFor(...parts: (string | number | undefined)[]): number {
  return hashString(parts.map((p) => p ?? "").join("|"));
}
