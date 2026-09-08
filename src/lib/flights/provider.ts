import "server-only";
import type { FlightProvider, Offer } from "./types";
import { MockFlightProvider } from "./mock";

let cached: FlightProvider | null = null;

/**
 * Returns the configured inventory provider.
 *  - FLIGHT_PROVIDER=duffel + DUFFEL_ACCESS_TOKEN → live Duffel inventory
 *  - otherwise → deterministic mock inventory
 */
export function getFlightProvider(): FlightProvider {
  if (cached) return cached;
  const wanted = (process.env.FLIGHT_PROVIDER ?? "mock").toLowerCase();
  if (wanted === "duffel" && process.env.DUFFEL_ACCESS_TOKEN) {
    // Lazy import keeps the mock build free of the Duffel adapter.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DuffelFlightProvider } = require("./duffel") as typeof import("./duffel");
    cached = new DuffelFlightProvider(process.env.DUFFEL_ACCESS_TOKEN);
  } else {
    cached = new MockFlightProvider();
  }
  return cached;
}

export function isDemoInventory(): boolean {
  return getFlightProvider().id === "mock";
}

/** Fare-brand siblings for an offer (Basic → Main → Flex). Empty when the provider can't upsell. */
export async function getFareOptions(offerId: string): Promise<Offer[]> {
  const provider = getFlightProvider() as FlightProvider & { fareOptions?: (id: string) => Promise<Offer[]> };
  if (typeof provider.fareOptions === "function") return provider.fareOptions(offerId);
  return [];
}
