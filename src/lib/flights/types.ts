/**
 * Core flight domain model for Air1 Tickets.
 *
 * The shapes below are provider-agnostic: the mock engine and the Duffel
 * adapter both normalise into them, so UI, booking and SEO code never depend
 * on a specific inventory source.
 *
 * Conventions
 *  - Money is in whole USD dollars (floats allowed, e.g. 218.4). Never cents.
 *  - Times are ISO *local* wall-clock strings without offset, e.g.
 *    "2026-10-12T07:45", in the timezone of the airport they refer to.
 *  - Dates are "YYYY-MM-DD".
 *  - Airports and airlines are referenced by IATA code.
 */

export type CabinClass = "economy" | "premium_economy" | "business" | "first";
export const CABIN_CLASSES: CabinClass[] = ["economy", "premium_economy", "business", "first"];
export const CABIN_LABELS: Record<CabinClass, string> = {
  economy: "Economy",
  premium_economy: "Premium Economy",
  business: "Business",
  first: "First",
};

export type TripType = "round_trip" | "one_way";
export type PassengerType = "adult" | "child" | "infant";

export interface PassengerCounts {
  adults: number;
  children: number; // 2–11
  infants: number; // under 2, on lap
}

export interface Airport {
  iata: string;
  icao?: string;
  name: string;
  city: string;
  /** Metropolitan area code when the city has several airports (NYC, CHI, WAS, LON, TYO…). */
  metro?: string;
  /** Two-letter US state code for US airports. */
  state?: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  lat: number;
  lon: number;
  /** IANA timezone, e.g. "America/New_York". */
  tz: string;
  /** 1 (small regional) … 5 (mega hub). Drives flight frequency in the mock engine. */
  size: 1 | 2 | 3 | 4 | 5;
  /** Passenger-facing keywords for search matching (nicknames, boroughs, etc.). */
  keywords?: string[];
}

export type Alliance = "oneworld" | "skyteam" | "star";

export interface Airline {
  iata: string;
  icao?: string;
  name: string;
  /** URL slug, e.g. "delta-air-lines". */
  slug: string;
  country: string;
  countryCode: string;
  alliance?: Alliance;
  /** Ultra low cost / low cost carrier — affects fares and included bags. */
  lowCost?: boolean;
  /** Hub / focus city IATA codes used to build connections in the mock engine. */
  hubs: string[];
  /** Brand colour used for the generated logo mark. */
  color: string;
  website?: string;
  /** Aircraft types commonly operated (for realism only). */
  fleet?: string[];
  /** Cabin classes offered. Defaults to all four. */
  cabins?: CabinClass[];
}

export interface SearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  passengers: PassengerCounts;
  cabin: CabinClass;
  directOnly?: boolean;
}

export interface Segment {
  id: string;
  /** Airline selling the ticket for this segment. */
  marketingCarrier: string;
  /** Airline actually flying it (regional partners, codeshares). */
  operatingCarrier: string;
  /** e.g. "DL 1234" — marketing carrier + number. */
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string; // local at origin
  arrival: string; // local at destination
  durationMinutes: number;
  aircraft?: string;
  originTerminal?: string;
  destinationTerminal?: string;
  cabin: CabinClass;
  /** Single-letter fare basis class, e.g. "Y", "B", "J". */
  bookingClass?: string;
  distanceMiles?: number;
}

export interface Layover {
  airport: string;
  durationMinutes: number;
  /** True when the layover crosses midnight local time. */
  overnight: boolean;
  /** True when the connection changes airports (e.g. JFK → EWR). */
  airportChange?: boolean;
}

/** One direction of travel (outbound or return), possibly with connections. */
export interface Slice {
  id: string;
  origin: string;
  destination: string;
  segments: Segment[];
  layovers: Layover[];
  departure: string;
  arrival: string;
  /** Total elapsed time including layovers. */
  durationMinutes: number;
  stops: number;
  /** Calendar days between departure and arrival in local time (0, 1, 2 …). */
  daysOffset: number;
}

export type SeatSelection = "free" | "paid" | "unavailable";

export interface FareConditions {
  /** Marketing brand name, e.g. "Basic Economy", "Main Cabin", "Blue Basic". */
  brand: string;
  carryOnIncluded: boolean;
  checkedBagsIncluded: number;
  /** Price of the first paid checked bag per passenger per direction, if bags aren't included. */
  checkedBagFee?: number;
  refundable: boolean;
  changeable: boolean;
  /** Fee to change dates when `changeable` is true (0 = free changes). */
  changeFee?: number;
  seatSelection: SeatSelection;
}

export interface OfferPrice {
  currency: "USD";
  /** Grand total for all passengers. */
  total: number;
  base: number;
  taxes: number;
  /** Fare for one adult, all-in — what result cards display. */
  perAdult: number;
  perChild?: number;
  perInfant?: number;
}

export type OfferTag = "best" | "cheapest" | "fastest";

export interface Offer {
  id: string;
  provider: ProviderId;
  /** Validating carrier: who issues the ticket. */
  owner: string;
  slices: Slice[];
  passengers: PassengerCounts;
  cabin: CabinClass;
  price: OfferPrice;
  fare: FareConditions;
  /** ISO timestamp after which the offer must be re-priced. */
  expiresAt: string;
  seatsRemaining?: number;
  /** Estimated CO₂ per passenger, kg. */
  emissionsKg?: number;
  tags?: OfferTag[];
}

export interface SearchResult {
  searchId: string;
  params: SearchParams;
  offers: Offer[];
  createdAt: string;
  provider: ProviderId;
}

export type ProviderId = "mock" | "duffel";

/* ───────────────────────────── Booking inputs ───────────────────────────── */

export type Gender = "m" | "f" | "x";
export type Title = "mr" | "ms" | "mrs" | "mx" | "dr";

export interface PassengerInput {
  type: PassengerType;
  title: Title;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: Gender;
  /** Passport details are required for international itineraries. */
  passportNumber?: string;
  passportCountry?: string; // ISO alpha-2
  passportExpiry?: string; // YYYY-MM-DD
  knownTravelerNumber?: string;
  redressNumber?: string;
  frequentFlyerAirline?: string;
  frequentFlyerNumber?: string;
}

export interface ContactInput {
  email: string;
  phone: string;
  /** Optional marketing opt-in. */
  newsletter?: boolean;
}

export interface ExtrasInput {
  /** Extra checked bags per passenger, per direction. */
  checkedBags: number;
  /** Selected seat labels keyed by `${sliceIndex}:${segmentIndex}:${passengerIndex}` */
  seats?: Record<string, string>;
  travelInsurance: boolean;
  flexibleTicket: boolean;
  priorityBoarding: boolean;
}

export interface ExtrasPricing {
  checkedBagFee: number; // per bag per passenger per direction
  travelInsurance: number; // per passenger
  flexibleTicket: number; // per passenger
  priorityBoarding: number; // per passenger per direction
  seatFeeFrom: number; // per seat per segment
}

export interface OrderRequest {
  offer: Offer;
  passengers: PassengerInput[];
  contact: ContactInput;
  extras: ExtrasInput;
  /** Our internal booking reference (Air1 PNR) — generated before calling the provider. */
  bookingReference: string;
  /** Payment reference from Stripe (or demo) proving funds were captured. */
  paymentReference: string;
  totalCharged: number;
}

export type OrderStatus = "confirmed" | "pending" | "failed";

export interface OrderResult {
  status: OrderStatus;
  providerOrderId: string;
  /** Airline record locator (PNR) — what passengers use with the airline. */
  airlinePnr: string;
  ticketNumbers: string[];
  /** Populated when status === "failed" with a passenger-friendly reason. */
  failureReason?: string;
}

export interface PriceCalendarEntry {
  date: string;
  /** Lowest economy fare per adult, all-in. */
  price: number;
}

/* ─────────────────────────── Provider interface ─────────────────────────── */

export interface FlightProvider {
  readonly id: ProviderId;
  /** Search for offers. Implementations must return offers sorted by total price ascending. */
  search(params: SearchParams): Promise<Offer[]>;
  /** Fetch/re-price a single offer. Returns null if it expired or is unknown. */
  getOffer(offerId: string): Promise<Offer | null>;
  /** Issue tickets. Called only after payment has been captured. */
  createOrder(request: OrderRequest): Promise<OrderResult>;
  /** Cancel an order; returns refund amount in USD. Optional for providers that don't support it. */
  cancelOrder?(providerOrderId: string): Promise<{ refundAmount: number }>;
  /** Lowest fare per day for a month ("YYYY-MM"). Used by route pages and the date picker. */
  priceCalendar(origin: string, destination: string, month: string, cabin?: CabinClass): Promise<PriceCalendarEntry[]>;
}

/* ───────────────────────────── Helpers/guards ───────────────────────────── */

export function totalPassengers(p: PassengerCounts): number {
  return p.adults + p.children + p.infants;
}

export function isCabinClass(v: unknown): v is CabinClass {
  return typeof v === "string" && (CABIN_CLASSES as string[]).includes(v);
}

/* ───────────────────────────── Fare brands ─────────────────────────────── */

/**
 * Airline fare families, e.g. Delta "Basic Economy" / "Main Cabin" / "Comfort+".
 * Used by the mock engine to generate realistic branded fares.
 */
export interface FareBrandDef extends FareConditions {
  cabin: CabinClass;
  /** Multiplier applied to the base fare (1.0 = the cheapest fare in that cabin). */
  priceMultiplier: number;
}
