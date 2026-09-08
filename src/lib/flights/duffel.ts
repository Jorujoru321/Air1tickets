/**
 * Duffel adapter (https://duffel.com/docs/api). Activated with
 *   FLIGHT_PROVIDER=duffel  DUFFEL_ACCESS_TOKEN=duffel_test_…
 *
 * Duffel gives live airline inventory and issues real tickets, with a test
 * mode that returns realistic fake airlines ("Duffel Airways"). Everything is
 * normalised into the Air1 domain model in `./types`.
 */
import type {
  CabinClass,
  FlightProvider,
  Layover,
  Offer,
  OrderRequest,
  OrderResult,
  PassengerType,
  PriceCalendarEntry,
  SearchParams,
  Segment,
  Slice,
} from "./types";
import { getAirport } from "@/data/airports";
import { dayOffset, minutesBetween } from "./geo";

const API = "https://api.duffel.com";
const VERSION = "v2";

type Json = Record<string, unknown>;

interface DuffelSegment {
  id: string;
  marketing_carrier: { iata_code: string };
  operating_carrier: { iata_code: string };
  marketing_carrier_flight_number: string;
  origin: { iata_code: string; time_zone?: string };
  destination: { iata_code: string; time_zone?: string };
  departing_at: string; // ISO with offset or local
  arriving_at: string;
  duration?: string; // ISO 8601 duration
  aircraft?: { name: string } | null;
  origin_terminal?: string | null;
  destination_terminal?: string | null;
  distance?: string | null;
  passengers: { cabin_class: string; cabin_class_marketing_name?: string; fare_basis_code?: string; baggages?: { type: string; quantity: number }[] }[];
}

interface DuffelSlice {
  id: string;
  origin: { iata_code: string };
  destination: { iata_code: string };
  segments: DuffelSegment[];
  duration?: string;
  conditions?: { change_before_departure?: { allowed: boolean; penalty_amount?: string | null } | null };
}

interface DuffelOffer {
  id: string;
  owner: { iata_code: string; name: string };
  slices: DuffelSlice[];
  total_amount: string;
  total_currency: string;
  base_amount: string;
  tax_amount: string | null;
  expires_at: string;
  passengers: { id: string; type: string }[];
  conditions?: {
    refund_before_departure?: { allowed: boolean; penalty_amount?: string | null } | null;
    change_before_departure?: { allowed: boolean; penalty_amount?: string | null } | null;
  };
  available_services?: unknown[];
  total_emissions_kg?: string | null;
}

function isoDurationToMinutes(iso?: string): number | undefined {
  if (!iso) return undefined;
  const m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/.exec(iso);
  if (!m) return undefined;
  return (Number(m[1] ?? 0) * 24 + Number(m[2] ?? 0)) * 60 + Number(m[3] ?? 0);
}

/** Duffel returns local times like "2026-10-12T07:45:00" — keep "YYYY-MM-DDTHH:mm". */
function localIso(s: string): string {
  return s.slice(0, 16);
}

function toCabin(c: string): CabinClass {
  if (c === "premium_economy" || c === "business" || c === "first") return c;
  return "economy";
}

export class DuffelFlightProvider implements FlightProvider {
  readonly id = "duffel" as const;

  constructor(private readonly token: string) {}

  private async request<T>(method: "GET" | "POST", path: string, body?: Json): Promise<T> {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Duffel-Version": VERSION,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip",
      },
      body: body ? JSON.stringify({ data: body }) : undefined,
      cache: "no-store",
    });
    const json = (await res.json()) as { data?: T; errors?: { message: string; title?: string }[] };
    if (!res.ok || !json.data) {
      const msg = json.errors?.map((e) => e.title ?? e.message).join("; ") ?? `Duffel ${res.status}`;
      throw new Error(msg);
    }
    return json.data;
  }

  async search(params: SearchParams): Promise<Offer[]> {
    const passengers: { type: PassengerType }[] = [];
    for (let i = 0; i < params.passengers.adults; i++) passengers.push({ type: "adult" });
    for (let i = 0; i < params.passengers.children; i++) passengers.push({ type: "child" });
    for (let i = 0; i < params.passengers.infants; i++) passengers.push({ type: "infant" });
    const slices = [{ origin: params.origin, destination: params.destination, departure_date: params.departDate }];
    if (params.returnDate) slices.push({ origin: params.destination, destination: params.origin, departure_date: params.returnDate });
    const req = await this.request<{ offers: DuffelOffer[] }>("POST", "/air/offer_requests?return_offers=true&supplier_timeout=15000", {
      slices,
      passengers: passengers.map((p) => (p.type === "child" ? { age: 8 } : p.type === "infant" ? { age: 1 } : { type: "adult" })),
      cabin_class: params.cabin,
      max_connections: params.directOnly ? 0 : 1,
    });
    const offers = req.offers.map((o) => this.normalise(o, params)).filter((o): o is Offer => Boolean(o));
    offers.sort((a, b) => a.price.total - b.price.total);
    return offers;
  }

  async getOffer(offerId: string): Promise<Offer | null> {
    try {
      const o = await this.request<DuffelOffer>("GET", `/air/offers/${offerId}?return_available_services=true`);
      return this.normalise(o);
    } catch {
      return null;
    }
  }

  async createOrder(request: OrderRequest): Promise<OrderResult> {
    const offer = await this.request<DuffelOffer>("GET", `/air/offers/${request.offer.id}`);
    const passengers = offer.passengers.map((p, i) => {
      const input = request.passengers[i];
      return {
        id: p.id,
        title: input.title,
        gender: input.gender === "x" ? "m" : input.gender,
        given_name: input.firstName,
        family_name: input.lastName,
        born_on: input.dateOfBirth,
        email: request.contact.email,
        phone_number: request.contact.phone.startsWith("+") ? request.contact.phone : `+1${request.contact.phone.replace(/\D/g, "")}`,
        ...(input.passportNumber
          ? {
              identity_documents: [
                {
                  type: "passport",
                  unique_identifier: input.passportNumber,
                  issuing_country_code: input.passportCountry,
                  expires_on: input.passportExpiry,
                },
              ],
            }
          : {}),
      };
    });
    try {
      const order = await this.request<{ id: string; booking_reference: string; documents?: { unique_identifier: string }[] }>("POST", "/air/orders", {
        type: "instant",
        selected_offers: [offer.id],
        passengers,
        payments: [{ type: "balance", amount: offer.total_amount, currency: offer.total_currency }],
        metadata: { air1_reference: request.bookingReference, payment: request.paymentReference },
      });
      return {
        status: "confirmed",
        providerOrderId: order.id,
        airlinePnr: order.booking_reference,
        ticketNumbers: (order.documents ?? []).map((d) => d.unique_identifier),
      };
    } catch (e) {
      return {
        status: "failed",
        providerOrderId: "",
        airlinePnr: "",
        ticketNumbers: [],
        failureReason: (e as Error).message,
      };
    }
  }

  async cancelOrder(providerOrderId: string): Promise<{ refundAmount: number }> {
    const c = await this.request<{ id: string; refund_amount: string }>("POST", "/air/order_cancellations", { order_id: providerOrderId });
    const confirmed = await this.request<{ refund_amount: string }>("POST", `/air/order_cancellations/${c.id}/actions/confirm`);
    return { refundAmount: Number(confirmed.refund_amount) };
  }

  async priceCalendar(origin: string, destination: string, month: string, cabin: CabinClass = "economy"): Promise<PriceCalendarEntry[]> {
    // Duffel has no calendar endpoint; route pages fall back to the model-based estimate.
    const { priceCalendarFor } = await import("./mock/engine");
    return priceCalendarFor(origin, destination, month, cabin, true);
  }

  private normalise(o: DuffelOffer, params?: SearchParams): Offer | null {
    if (o.total_currency !== "USD") return null;
    const slices: Slice[] = o.slices.map((s) => {
      const segments: Segment[] = s.segments.map((seg) => {
        const oa = getAirport(seg.origin.iata_code);
        const da = getAirport(seg.destination.iata_code);
        const departure = localIso(seg.departing_at);
        const arrival = localIso(seg.arriving_at);
        const duration =
          isoDurationToMinutes(seg.duration) ??
          (oa && da ? minutesBetween(departure, oa.tz, arrival, da.tz) : 0);
        return {
          id: seg.id,
          marketingCarrier: seg.marketing_carrier.iata_code,
          operatingCarrier: seg.operating_carrier.iata_code,
          flightNumber: `${seg.marketing_carrier.iata_code} ${seg.marketing_carrier_flight_number}`,
          origin: seg.origin.iata_code,
          destination: seg.destination.iata_code,
          departure,
          arrival,
          durationMinutes: duration,
          aircraft: seg.aircraft?.name ?? undefined,
          originTerminal: seg.origin_terminal ?? undefined,
          destinationTerminal: seg.destination_terminal ?? undefined,
          cabin: toCabin(seg.passengers[0]?.cabin_class ?? "economy"),
          bookingClass: seg.passengers[0]?.fare_basis_code?.[0],
          distanceMiles: seg.distance ? Math.round(Number(seg.distance) * 0.621371) : undefined,
        };
      });
      const layovers: Layover[] = [];
      for (let i = 1; i < segments.length; i++) {
        const prev = segments[i - 1];
        const next = segments[i];
        const pa = getAirport(prev.destination);
        const na = getAirport(next.origin);
        const minutes = pa && na ? minutesBetween(prev.arrival, pa.tz, next.departure, na.tz) : 0;
        layovers.push({
          airport: next.origin,
          durationMinutes: minutes,
          overnight: prev.arrival.slice(0, 10) !== next.departure.slice(0, 10),
          airportChange: prev.destination !== next.origin,
        });
      }
      const first = segments[0];
      const last = segments[segments.length - 1];
      const fa = getAirport(first.origin);
      const la = getAirport(last.destination);
      return {
        id: s.id,
        origin: s.origin.iata_code,
        destination: s.destination.iata_code,
        segments,
        layovers,
        departure: first.departure,
        arrival: last.arrival,
        durationMinutes: isoDurationToMinutes(s.duration) ?? (fa && la ? minutesBetween(first.departure, fa.tz, last.arrival, la.tz) : 0),
        stops: segments.length - 1,
        daysOffset: dayOffset(first.departure, last.arrival),
      };
    });

    const counts = { adults: 0, children: 0, infants: 0 };
    for (const p of o.passengers) {
      if (p.type === "adult") counts.adults++;
      else if (p.type === "child") counts.children++;
      else counts.infants++;
    }
    const total = Number(o.total_amount);
    const taxes = Number(o.tax_amount ?? 0);
    const paying = counts.adults + counts.children || 1;
    const firstSeg = o.slices[0]?.segments[0];
    const bags = firstSeg?.passengers[0]?.baggages ?? [];
    const checked = bags.filter((b) => b.type === "checked").reduce((n, b) => n + b.quantity, 0);
    const carry = bags.some((b) => b.type === "carry_on" && b.quantity > 0);
    const change = o.conditions?.change_before_departure;
    const refund = o.conditions?.refund_before_departure;
    return {
      id: o.id,
      provider: "duffel",
      owner: o.owner.iata_code,
      slices,
      passengers: params?.passengers ?? counts,
      cabin: params?.cabin ?? toCabin(firstSeg?.passengers[0]?.cabin_class ?? "economy"),
      price: {
        currency: "USD",
        total,
        base: Number(o.base_amount),
        taxes,
        perAdult: Math.round((total / paying) * 100) / 100,
      },
      fare: {
        brand: firstSeg?.passengers[0]?.cabin_class_marketing_name ?? "Economy",
        carryOnIncluded: carry || checked > 0,
        checkedBagsIncluded: checked,
        refundable: Boolean(refund?.allowed),
        changeable: Boolean(change?.allowed),
        changeFee: change?.penalty_amount ? Number(change.penalty_amount) : undefined,
        seatSelection: "paid",
      },
      expiresAt: o.expires_at,
      emissionsKg: o.total_emissions_kg ? Math.round(Number(o.total_emissions_kg)) : undefined,
    };
  }
}
