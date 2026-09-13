/**
 * Curated destination guides for /destinations, /flights-to and home-page cards.
 * Content lives in ./destinations/us.ts and ./destinations/international.ts.
 */
import type { Destination, Region } from "./types";
import { US_DESTINATIONS } from "./destinations/us";
import { INTERNATIONAL_DESTINATIONS } from "./destinations/international";
import { placeLabel } from "@/components/seo/geo-groups";

export { US_DESTINATIONS, INTERNATIONAL_DESTINATIONS };

export const DESTINATIONS: Destination[] = [
  ...US_DESTINATIONS,
  ...INTERNATIONAL_DESTINATIONS,
];

const bySlug = new Map(DESTINATIONS.map((d) => [d.slug, d]));
const byAirport = new Map<string, Destination>();
for (const d of DESTINATIONS)
  for (const a of d.airports) if (!byAirport.has(a)) byAirport.set(a, d);

export function getDestination(slug: string): Destination | undefined {
  return bySlug.get(slug.toLowerCase());
}

/** Destination guide for any airport that serves it (e.g. "LGA" → New York). */
export function getDestinationByAirport(iata: string): Destination | undefined {
  return byAirport.get(iata.toUpperCase());
}

export const POPULAR_DESTINATIONS: Destination[] = DESTINATIONS.filter(
  (d) => d.popular,
);

/**
 * Popular destinations for the home page and hub modules, spread across
 * countries rather than taken in file order.
 *
 * Plain `.slice()` on POPULAR_DESTINATIONS returns US cities only, because the
 * US list is concatenated first — so a visitor in Winnipeg would never see a
 * Canadian city on a site that sells them Canadian flights. This takes one
 * destination per country in turn until the list is full, which keeps the
 * strongest US cities at the front while guaranteeing Canada and the sun
 * destinations appear.
 */
export function featuredDestinations(count = 8): Destination[] {
  const queues = new Map<string, Destination[]>();
  for (const d of POPULAR_DESTINATIONS) {
    queues.set(d.countryCode, [...(queues.get(d.countryCode) ?? []), d]);
  }
  const out: Destination[] = [];
  while (out.length < count) {
    let added = false;
    for (const queue of queues.values()) {
      if (out.length >= count) break;
      const next = queue.shift();
      if (!next) continue;
      out.push(next);
      added = true;
    }
    if (!added) break;
  }
  return out;
}

export function getDestinationsByRegion(region: Region): Destination[] {
  return DESTINATIONS.filter((d) => d.region === region);
}

/** Human place labels ("Cancún, Mexico") used as datalist suggestions in hotel/activity search. */
export function destinationSuggestions(): string[] {
  return DESTINATIONS.map((d) => `${d.city}, ${placeLabel(d)}`).sort((a, b) =>
    a.localeCompare(b),
  );
}
