/**
 * Mock inventory engine: builds realistic, deterministic itineraries and
 * prices for a search. Everything derives from (params, datasets), so an
 * offer id can be decoded and re-generated to exactly the same offer.
 */
import type {
  Airport,
  CabinClass,
  FareConditions,
  Layover,
  Offer,
  PassengerCounts,
  PriceCalendarEntry,
  SearchParams,
  Segment,
  Slice,
} from "../types";
import { CABIN_CLASSES } from "../types";
import { AIRLINES, getAirline, type AirlineProfile } from "@/data/airlines";
import { getAirport } from "@/data/airports";
import { dayOffset, distanceMiles } from "../geo";
import {
  airportOrThrow,
  flightOnDate,
  isUS,
  nonstopService,
  offersCabin,
  POINT_TO_POINT,
  timetable,
  type ScheduledFlight,
} from "./network";
import { ROUND_TRIP_FACTOR, roundFare, sliceFare, splitTaxes, tripKind, advancePurchaseFactor, dayOfWeekFactor, seasonFactor, routeBase, carrierFactor, cabinFactor, todayDate } from "./pricing";
import { Rng, shortHash } from "./rng";
import { addDays, daysBetween } from "@/lib/utils";

/* ────────────────────────────── Slices ────────────────────────────────── */

interface SliceCandidate {
  slice: Slice;
  owner: AirlineProfile;
  /** All-in per adult for this direction alone. */
  fare: number;
  signature: string;
}

interface Leg {
  flight: ScheduledFlight;
  date: string;
}

function segmentFrom(leg: Leg, cabin: CabinClass): Segment {
  const { flight, date } = leg;
  const t = flightOnDate(flight, date);
  return {
    id: shortHash(`${flight.flightNumber}${date}${flight.origin.iata}`),
    marketingCarrier: flight.airline.iata,
    operatingCarrier: flight.operatingCarrier,
    flightNumber: flight.flightNumber,
    origin: flight.origin.iata,
    destination: flight.destination.iata,
    departure: t.departure,
    arrival: t.arrival,
    durationMinutes: flight.blockMinutes,
    aircraft: flight.aircraft,
    originTerminal: flight.originTerminal,
    destinationTerminal: flight.destinationTerminal,
    cabin,
    bookingClass: bookingClassFor(cabin),
    distanceMiles: Math.round(flight.distanceMiles),
  };
}

function bookingClassFor(cabin: CabinClass): string {
  return { economy: "Y", premium_economy: "W", business: "J", first: "F" }[cabin];
}

function legSignature(leg: Leg): string {
  return `${leg.flight.flightNumber.replace(" ", "")}@${leg.date}`;
}

function buildSlice(legs: Leg[], cabin: CabinClass): { slice: Slice; signature: string } {
  const segments = legs.map((l) => segmentFrom(l, cabin));
  const layovers: Layover[] = [];
  for (let i = 1; i < legs.length; i++) {
    const prev = flightOnDate(legs[i - 1].flight, legs[i - 1].date);
    const next = flightOnDate(legs[i].flight, legs[i].date);
    const minutes = Math.round((next.departureUtc - prev.arrivalUtc) / 60_000);
    layovers.push({
      airport: legs[i].flight.origin.iata,
      durationMinutes: minutes,
      overnight: prev.arrival.slice(0, 10) !== next.departure.slice(0, 10),
    });
  }
  const first = flightOnDate(legs[0].flight, legs[0].date);
  const last = flightOnDate(legs[legs.length - 1].flight, legs[legs.length - 1].date);
  const signature = legs.map(legSignature).join(".");
  const slice: Slice = {
    id: shortHash(`slice:${signature}:${cabin}`, 10),
    origin: legs[0].flight.origin.iata,
    destination: legs[legs.length - 1].flight.destination.iata,
    segments,
    layovers,
    departure: first.departure,
    arrival: last.arrival,
    durationMinutes: Math.round((last.arrivalUtc - first.departureUtc) / 60_000),
    stops: legs.length - 1,
    daysOffset: dayOffset(first.departure, last.arrival),
  };
  return { slice, signature };
}

function candidateFrom(legs: Leg[], owner: AirlineProfile, cabin: CabinClass, today: string): SliceCandidate {
  const { slice, signature } = buildSlice(legs, cabin);
  const origin = legs[0].flight.origin;
  const destination = legs[legs.length - 1].flight.destination;
  const fare = sliceFare({
    origin,
    destination,
    date: legs[0].date,
    cabin,
    airline: owner,
    stops: slice.stops,
    departureTime: legs[0].flight.departureTime,
    signature,
    today,
  });
  return { slice, owner, fare, signature };
}

/** Pick connecting flights from `next` that depart within the allowed window after `arrivalUtc`. */
function connections(arrivalUtc: number, next: ScheduledFlight[], date: string, minMinutes: number, maxMinutes: number): Leg[] {
  const out: Leg[] = [];
  for (const d of [date, addDays(date, 1)]) {
    for (const f of next) {
      const t = flightOnDate(f, d);
      const gap = (t.departureUtc - arrivalUtc) / 60_000;
      if (gap >= minMinutes && gap <= maxMinutes) out.push({ flight: f, date: d });
    }
  }
  return out;
}

function partnersAt(hub: Airport, carrier: AirlineProfile, international: boolean): AirlineProfile[] {
  const list = [carrier];
  if (!international || !carrier.alliance) return list;
  for (const al of AIRLINES) {
    if (al.iata !== carrier.iata && al.alliance === carrier.alliance && al.hubs.includes(hub.iata)) list.push(al);
  }
  return list;
}

const MAX_NONSTOP_PER_AIRLINE = 14;
const MAX_ONESTOP_PER_AIRLINE = 6;

/** Generate all plausible itineraries for one direction on one date. */
export function sliceCandidates(origin: Airport, destination: Airport, date: string, cabin: CabinClass, directOnly = false, today = todayDate()): SliceCandidate[] {
  const out: SliceCandidate[] = [];
  const directDist = distanceMiles(origin, destination);
  const international = !(isUS(origin) && isUS(destination));
  const carriers = AIRLINES.filter((al) => offersCabin(al, cabin) && (international || al.countryCode === "US"));

  for (const al of carriers) {
    const svc = nonstopService(al, origin, destination);
    if (svc) {
      for (const f of timetable(svc).slice(0, MAX_NONSTOP_PER_AIRLINE)) {
        out.push(candidateFrom([{ flight: f, date }], al, cabin, today));
      }
    }
  }
  if (directOnly) return finalize(out);

  const minConnect = international ? 75 : 45;
  const maxConnect = international ? 400 : 300;

  // One-stop itineraries via the marketing carrier's hubs (and alliance partners' hubs for international trips).
  for (const al of carriers) {
    if (POINT_TO_POINT.has(al.iata)) continue; // no connections sold
    const perAirline: SliceCandidate[] = [];
    const maxCircuity = al.lowCost ? 1.35 : 1.75;
    for (const hubCode of al.hubs) {
      if (hubCode === origin.iata || hubCode === destination.iata) continue;
      const hub = getAirport(hubCode);
      if (!hub) continue;
      const circuity = (distanceMiles(origin, hub) + distanceMiles(hub, destination)) / directDist;
      if (circuity > maxCircuity) continue;
      const leg1 = nonstopService(al, origin, hub);
      if (!leg1) continue;
      for (const second of partnersAt(hub, al, international)) {
        if (!offersCabin(second, cabin)) continue;
        const leg2 = nonstopService(second, hub, destination);
        if (!leg2) continue;
        const tt2 = timetable(leg2);
        const options: SliceCandidate[] = [];
        for (const f1 of timetable(leg1)) {
          const t1 = flightOnDate(f1, date);
          for (const c of connections(t1.arrivalUtc, tt2, date, minConnect, maxConnect).slice(0, 2)) {
            options.push(candidateFrom([{ flight: f1, date }, c], al, cabin, today));
          }
        }
        options.sort((x, y) => x.slice.durationMinutes - y.slice.durationMinutes);
        perAirline.push(...options.slice(0, 4));
      }
    }
    perAirline.sort((x, y) => x.fare - y.fare);
    out.push(...perAirline.slice(0, al.lowCost ? 3 : MAX_ONESTOP_PER_AIRLINE));
  }

  // Two-stop itineraries only when the market is thin.
  if (out.length < 6) {
    for (const al of carriers) {
      if (al.lowCost) continue;
      for (const h1Code of al.hubs) {
        if (h1Code === origin.iata || h1Code === destination.iata) continue;
        const h1 = getAirport(h1Code);
        if (!h1) continue;
        const leg1 = nonstopService(al, origin, h1);
        if (!leg1) continue;
        for (const mid of partnersAt(h1, al, international)) {
          for (const h2Code of mid.hubs) {
            if ([origin.iata, destination.iata, h1Code].includes(h2Code)) continue;
            const h2 = getAirport(h2Code);
            if (!h2) continue;
            const circuity = (distanceMiles(origin, h1) + distanceMiles(h1, h2) + distanceMiles(h2, destination)) / directDist;
            if (circuity > 1.9) continue;
            const leg2 = nonstopService(mid, h1, h2);
            const leg3 = nonstopService(mid, h2, destination);
            if (!leg2 || !leg3) continue;
            const tt2 = timetable(leg2);
            const tt3 = timetable(leg3);
            const f1 = timetable(leg1)[0];
            const t1 = flightOnDate(f1, date);
            const c2 = connections(t1.arrivalUtc, tt2, date, minConnect, maxConnect)[0];
            if (!c2) continue;
            const t2 = flightOnDate(c2.flight, c2.date);
            const c3 = connections(t2.arrivalUtc, tt3, c2.date, minConnect, maxConnect)[0];
            if (!c3) continue;
            out.push(candidateFrom([{ flight: f1, date }, c2, c3], al, cabin, today));
            if (out.length >= 12) break;
          }
        }
      }
    }
  }
  return finalize(out);
}

function finalize(list: SliceCandidate[]): SliceCandidate[] {
  const seen = new Set<string>();
  const unique = list.filter((c) => {
    if (seen.has(c.signature)) return false;
    seen.add(c.signature);
    return true;
  });
  unique.sort((a, b) => a.fare - b.fare);
  return unique;
}

/* ────────────────────────────── Offers ────────────────────────────────── */

interface OfferSeed {
  params: SearchParams;
  outbound: SliceCandidate;
  inbound?: SliceCandidate;
  brandIndex: number;
}

export interface DecodedOfferId {
  params: SearchParams;
  signatures: string[];
  brandIndex: number;
}

function b64url(s: string): string {
  return Buffer.from(s, "utf8").toString("base64url");
}
function fromB64url(s: string): string {
  return Buffer.from(s, "base64url").toString("utf8");
}

export function encodeOfferId(params: SearchParams, signatures: string[], brandIndex: number): string {
  const p = params.passengers;
  const compact = [
    params.origin,
    params.destination,
    params.departDate,
    params.returnDate ?? "",
    CABIN_CLASSES.indexOf(params.cabin),
    p.adults,
    p.children,
    p.infants,
    signatures.join("|"),
    brandIndex,
  ];
  return `mk_${b64url(JSON.stringify(compact))}`;
}

export function decodeOfferId(id: string): DecodedOfferId | null {
  if (!id.startsWith("mk_")) return null;
  try {
    const arr = JSON.parse(fromB64url(id.slice(3))) as unknown[];
    if (!Array.isArray(arr) || arr.length !== 10) return null;
    const [o, d, dd, rd, ci, a, c, i, sig, bi] = arr as [string, string, string, string, number, number, number, number, string, number];
    return {
      params: {
        origin: o,
        destination: d,
        departDate: dd,
        returnDate: rd || undefined,
        passengers: { adults: a, children: c, infants: i },
        cabin: CABIN_CLASSES[ci] ?? "economy",
      },
      signatures: sig.split("|"),
      brandIndex: bi,
    };
  } catch {
    return null;
  }
}

function brandsFor(owner: AirlineProfile, cabin: CabinClass) {
  const list = owner.fareBrands.filter((b) => b.cabin === cabin);
  return list.length ? list : owner.fareBrands.filter((b) => b.cabin === "economy");
}

function fareConditions(owner: AirlineProfile, cabin: CabinClass, brandIndex: number): FareConditions {
  const brands = brandsFor(owner, cabin);
  const b = brands[Math.min(brandIndex, brands.length - 1)];
  return {
    brand: b.brand,
    carryOnIncluded: b.carryOnIncluded,
    checkedBagsIncluded: b.checkedBagsIncluded,
    checkedBagFee: b.checkedBagFee,
    refundable: b.refundable,
    changeable: b.changeable,
    changeFee: b.changeFee,
    seatSelection: b.seatSelection,
  };
}

function emissionsFor(slices: Slice[]): number {
  let kg = 0;
  for (const s of slices) {
    for (const seg of s.segments) {
      const d = seg.distanceMiles ?? 500;
      kg += 18 + d * (d < 600 ? 0.155 : d < 2500 ? 0.112 : 0.097);
    }
  }
  return Math.round(kg);
}

function makeOffer(seed: OfferSeed, now: Date): Offer {
  const { params, outbound, inbound, brandIndex } = seed;
  const owner = outbound.owner;
  const origin = airportOrThrow(params.origin);
  const destination = airportOrThrow(params.destination);
  const brands = brandsFor(owner, params.cabin);
  const brand = brands[Math.min(brandIndex, brands.length - 1)];
  const slices = inbound ? [outbound.slice, inbound.slice] : [outbound.slice];
  const signatures = slices.map((_, i) => (i === 0 ? outbound.signature : inbound!.signature));

  let perAdultRaw = outbound.fare + (inbound ? inbound.fare : 0);
  if (inbound) perAdultRaw *= ROUND_TRIP_FACTOR;
  perAdultRaw *= brand.priceMultiplier;
  const perAdult = roundFare(perAdultRaw);
  const kind = tripKind(origin, destination);
  const perChild = perAdult;
  const perInfant = kind === "domestic" ? 0 : roundFare(perAdult * 0.1);
  const { adults, children, infants } = params.passengers;
  const total = perAdult * adults + perChild * children + perInfant * infants;

  // Taxes: split each passenger's fare using the outbound slice's segment count (+ inbound for round trips)
  const segmentsPerPax = slices.reduce((n, s) => n + s.segments.length, 0);
  const split = splitTaxes(perAdult, origin, destination, segmentsPerPax, params.cabin);
  const taxes = Math.round((split.taxes * (adults + children) + (infants ? perInfant * 0.3 * infants : 0)) * 100) / 100;

  const rng = new Rng(`offer:${signatures.join("|")}:${params.departDate}`);
  const seatsRoll = rng.int(1, 12);

  return {
    id: encodeOfferId(params, signatures, brandIndex),
    provider: "mock",
    owner: owner.iata,
    slices,
    passengers: params.passengers,
    cabin: params.cabin,
    price: {
      currency: "USD",
      total: Math.round(total * 100) / 100,
      base: Math.round((total - taxes) * 100) / 100,
      taxes,
      perAdult,
      perChild,
      perInfant,
    },
    fare: fareConditions(owner, params.cabin, brandIndex),
    expiresAt: new Date(now.getTime() + 20 * 60_000).toISOString(),
    seatsRemaining: seatsRoll <= 5 ? seatsRoll : undefined,
    emissionsKg: emissionsFor(slices),
  };
}

const MAX_OFFERS = 160;
const PER_AIRLINE_ROUND_TRIP = 6;

export function tagOffers(offers: Offer[]): Offer[] {
  if (!offers.length) return offers;
  const minPrice = Math.min(...offers.map((o) => o.price.total));
  const dur = (o: Offer) => o.slices.reduce((n, s) => n + s.durationMinutes, 0);
  const minDur = Math.min(...offers.map(dur));
  let best: Offer | null = null;
  let bestScore = Infinity;
  for (const o of offers) {
    const stops = o.slices.reduce((n, s) => n + s.stops, 0);
    const score = (o.price.total / minPrice) * 0.5 + (dur(o) / minDur) * 0.35 + stops * 0.1;
    if (score < bestScore) {
      bestScore = score;
      best = o;
    }
  }
  const cheapest = offers.find((o) => o.price.total === minPrice)!;
  const fastest = offers.reduce((a, b) => (dur(b) < dur(a) ? b : a));
  for (const o of offers) o.tags = undefined;
  const add = (o: Offer, t: "best" | "cheapest" | "fastest") => {
    o.tags = [...(o.tags ?? []), t];
  };
  if (best) add(best, "best");
  add(cheapest, "cheapest");
  add(fastest, "fastest");
  return offers;
}

/** Full search: returns offers sorted by total price ascending. */
export function searchOffers(params: SearchParams, now = new Date()): Offer[] {
  const origin = airportOrThrow(params.origin);
  const destination = airportOrThrow(params.destination);
  const today = todayDate();
  const outbound = sliceCandidates(origin, destination, params.departDate, params.cabin, params.directOnly, today);
  const seeds: OfferSeed[] = [];

  if (!params.returnDate) {
    for (const o of outbound.slice(0, MAX_OFFERS)) seeds.push({ params, outbound: o, brandIndex: 0 });
  } else {
    const inbound = sliceCandidates(destination, origin, params.returnDate, params.cabin, params.directOnly, today);
    const byOwnerIn = new Map<string, SliceCandidate[]>();
    for (const c of inbound) {
      const list = byOwnerIn.get(c.owner.iata) ?? [];
      list.push(c);
      byOwnerIn.set(c.owner.iata, list);
    }
    const byOwnerOut = new Map<string, SliceCandidate[]>();
    for (const c of outbound) {
      const list = byOwnerOut.get(c.owner.iata) ?? [];
      list.push(c);
      byOwnerOut.set(c.owner.iata, list);
    }
    for (const [ownerCode, outs] of byOwnerOut) {
      const ins = byOwnerIn.get(ownerCode);
      if (!ins) continue;
      // Keep nonstop and connecting itineraries separately so busy nonstop markets
      // (JFK–LAX) still show plenty of nonstop round trips next to cheaper connections.
      const pick = (list: SliceCandidate[]) => ({
        nonstop: list.filter((c) => c.slice.stops === 0).slice(0, PER_AIRLINE_ROUND_TRIP),
        connecting: list.filter((c) => c.slice.stops > 0).slice(0, PER_AIRLINE_ROUND_TRIP),
      });
      const o = pick(outs);
      const i = pick(ins);
      const byFare = (a: OfferSeed, b: OfferSeed) => a.outbound.fare + a.inbound!.fare - (b.outbound.fare + b.inbound!.fare);
      const cross = (a: SliceCandidate[], b: SliceCandidate[]) => a.flatMap((x) => b.map((y) => ({ params, outbound: x, inbound: y, brandIndex: 0 }) as OfferSeed));
      const nonstopCombos = cross(o.nonstop, i.nonstop).sort(byFare).slice(0, 8);
      const otherCombos = [...cross(o.connecting, i.connecting), ...cross(o.nonstop, i.connecting), ...cross(o.connecting, i.nonstop)].sort(byFare).slice(0, 8);
      seeds.push(...nonstopCombos, ...otherCombos);
    }
  }

  const offers = seeds.map((s) => makeOffer(s, now));
  offers.sort((a, b) => a.price.total - b.price.total || sumDuration(a) - sumDuration(b));
  return tagOffers(offers.slice(0, MAX_OFFERS));
}

function sumDuration(o: Offer): number {
  return o.slices.reduce((n, s) => n + s.durationMinutes, 0);
}

/** Rebuild a single offer from its id (re-pricing is deterministic). */
export function offerById(id: string, now = new Date()): Offer | null {
  const decoded = decodeOfferId(id);
  if (!decoded) return null;
  const { params, signatures, brandIndex } = decoded;
  const origin = getAirport(params.origin);
  const destination = getAirport(params.destination);
  if (!origin || !destination) return null;
  const today = todayDate();
  const outbound = sliceCandidates(origin, destination, params.departDate, params.cabin, false, today).find((c) => c.signature === signatures[0]);
  if (!outbound) return null;
  let inbound: SliceCandidate | undefined;
  if (params.returnDate) {
    inbound = sliceCandidates(destination, origin, params.returnDate, params.cabin, false, today).find((c) => c.signature === signatures[1]);
    if (!inbound) return null;
  }
  return makeOffer({ params, outbound, inbound, brandIndex }, now);
}

/** Sibling offers for every fare brand in the cabin (Basic → Main → Flexible …). */
export function fareOptionsFor(id: string, now = new Date()): Offer[] {
  const decoded = decodeOfferId(id);
  if (!decoded) return [];
  const base = offerById(id, now);
  if (!base) return [];
  const owner = getAirline(base.owner);
  if (!owner) return [base];
  const brands = brandsFor(owner, base.cabin);
  return brands.map((_, i) => offerById(encodeOfferId(decoded.params, decoded.signatures, i), now)!).filter(Boolean);
}

/* ─────────────────────────── Price calendar ───────────────────────────── */

const calendarCache = new Map<string, { at: number; entries: PriceCalendarEntry[] }>();
/** Empirically matches the calendar to the cheapest search result (see tests/unit/engine.test.ts). */
const CALENDAR_CALIBRATION = 0.66;

/**
 * Fast lowest-fare estimate per day for a month, consistent in shape with the
 * search results (same base model, best-case modifiers).
 */
export function priceCalendarFor(originCode: string, destinationCode: string, month: string, cabin: CabinClass = "economy", roundTrip = true): PriceCalendarEntry[] {
  const key = `${originCode}:${destinationCode}:${month}:${cabin}:${roundTrip}:${todayDate()}`;
  const cached = calendarCache.get(key);
  if (cached && Date.now() - cached.at < 60 * 60_000) return cached.entries;

  const origin = getAirport(originCode);
  const destination = getAirport(destinationCode);
  if (!origin || !destination) return [];
  const kind = tripKind(origin, destination);
  const international = kind !== "domestic";
  const carriers = AIRLINES.filter((al) => offersCabin(al, cabin) && (international || al.countryCode === "US"));
  let bestCarrier = 1.0;
  let hasNonstop = false;
  for (const al of carriers) {
    if (nonstopService(al, origin, destination)) {
      hasNonstop = true;
      bestCarrier = Math.min(bestCarrier, carrierFactor(al));
    }
  }
  // Search results' cheapest fare ≈ base × carrier × min(jitter) × off-peak time × (1-stop discount when connections exist)
  const base = routeBase(origin, destination) * (hasNonstop ? bestCarrier : 0.98) * cabinFactor(cabin, kind) * CALENDAR_CALIBRATION;
  const [y, m] = month.split("-").map(Number);
  const days = new Date(y, m, 0).getDate();
  const today = todayDate();
  const entries: PriceCalendarEntry[] = [];
  for (let d = 1; d <= days; d++) {
    const date = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const daysOut = daysBetween(today, date);
    if (daysOut < 0) continue;
    const rng = new Rng(`cal:${originCode}:${destinationCode}:${date}:${cabin}`);
    let fare = base * advancePurchaseFactor(daysOut) * dayOfWeekFactor(date) * seasonFactor(date, destination) * rng.range(0.95, 1.12);
    if (roundTrip) fare = fare * 2 * ROUND_TRIP_FACTOR;
    entries.push({ date, price: roundFare(Math.max(kind === "domestic" ? 39 : 89, fare)) });
  }
  calendarCache.set(key, { at: Date.now(), entries });
  return entries;
}
