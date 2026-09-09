/**
 * Curated destination guides for /destinations, /flights-to and home-page cards.
 * Content lives in ./destinations/us.ts and ./destinations/international.ts.
 */
import type { Destination, Region } from "./types";
import { US_DESTINATIONS } from "./destinations/us";
import { INTERNATIONAL_DESTINATIONS } from "./destinations/international";

export { US_DESTINATIONS, INTERNATIONAL_DESTINATIONS };

export const DESTINATIONS: Destination[] = [...US_DESTINATIONS, ...INTERNATIONAL_DESTINATIONS];

const bySlug = new Map(DESTINATIONS.map((d) => [d.slug, d]));
const byAirport = new Map<string, Destination>();
for (const d of DESTINATIONS) for (const a of d.airports) if (!byAirport.has(a)) byAirport.set(a, d);

export function getDestination(slug: string): Destination | undefined {
  return bySlug.get(slug.toLowerCase());
}

/** Destination guide for any airport that serves it (e.g. "LGA" → New York). */
export function getDestinationByAirport(iata: string): Destination | undefined {
  return byAirport.get(iata.toUpperCase());
}

export const POPULAR_DESTINATIONS: Destination[] = DESTINATIONS.filter((d) => d.popular);

export function getDestinationsByRegion(region: Region): Destination[] {
  return DESTINATIONS.filter((d) => d.region === region);
}
