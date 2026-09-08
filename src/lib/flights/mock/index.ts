import type { FlightProvider, Offer, OrderRequest, OrderResult, PriceCalendarEntry, SearchParams, CabinClass } from "../types";
import { fareOptionsFor, offerById, priceCalendarFor, searchOffers } from "./engine";
import { Rng } from "./rng";

/** Simulated network latency so loading states look real in development. */
async function simulateLatency(minMs: number, maxMs: number) {
  if (process.env.NODE_ENV === "test" || process.env.MOCK_NO_LATENCY) return;
  const ms = minMs + Math.random() * (maxMs - minMs);
  await new Promise((r) => setTimeout(r, ms));
}

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

/** Airline-style 6-character record locator (no 0/O/1/I ambiguity). */
export function generateAirlinePnr(seed: string): string {
  const rng = new Rng(seed);
  let s = "";
  for (let i = 0; i < 6; i++) s += rng.chance(0.7) ? LETTERS[rng.int(0, LETTERS.length - 1)] : String(rng.int(2, 9));
  return s;
}

export class MockFlightProvider implements FlightProvider {
  readonly id = "mock" as const;

  async search(params: SearchParams): Promise<Offer[]> {
    await simulateLatency(350, 900);
    return searchOffers(params);
  }

  async getOffer(offerId: string): Promise<Offer | null> {
    await simulateLatency(120, 350);
    return offerById(offerId);
  }

  async fareOptions(offerId: string): Promise<Offer[]> {
    return fareOptionsFor(offerId);
  }

  async createOrder(request: OrderRequest): Promise<OrderResult> {
    await simulateLatency(800, 1800);
    const pnr = generateAirlinePnr(`pnr:${request.bookingReference}`);
    const ticketNumbers = request.passengers.map((_, i) => {
      const rng = new Rng(`tkt:${request.bookingReference}:${i}`);
      const prefix = airlineTicketPrefix(request.offer.owner);
      return `${prefix}${String(rng.int(1_000_000_000, 9_999_999_999))}`;
    });
    return {
      status: "confirmed",
      providerOrderId: `mock_ord_${request.bookingReference.toLowerCase()}`,
      airlinePnr: pnr,
      ticketNumbers,
    };
  }

  async cancelOrder(): Promise<{ refundAmount: number }> {
    await simulateLatency(300, 800);
    return { refundAmount: 0 };
  }

  async priceCalendar(origin: string, destination: string, month: string, cabin: CabinClass = "economy"): Promise<PriceCalendarEntry[]> {
    return priceCalendarFor(origin, destination, month, cabin, true);
  }
}

/** IATA airline accounting prefixes (first three digits of an e-ticket number). */
function airlineTicketPrefix(iata: string): string {
  const prefixes: Record<string, string> = {
    AA: "001", DL: "006", UA: "016", WN: "526", B6: "279", AS: "027", NK: "487", F9: "422", HA: "173", G4: "402", SY: "337",
    AC: "014", WS: "838", AM: "139", CM: "230", AV: "134", LA: "045", BA: "125", VS: "932", EI: "053", AF: "057", KL: "074",
    LH: "220", LX: "724", OS: "257", IB: "075", TP: "047", AZ: "055", SK: "117", AY: "105", FI: "108", TK: "235", EK: "176",
    QR: "157", EY: "607", LY: "114", ET: "071", JL: "131", NH: "205", KE: "180", OZ: "988", CX: "160", BR: "695", CI: "297",
    SQ: "618", PR: "079", AI: "098", QF: "081", NZ: "086", FJ: "260",
  };
  return prefixes[iata] ?? "999";
}
