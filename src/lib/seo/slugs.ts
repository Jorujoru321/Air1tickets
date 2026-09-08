/**
 * URL slug helpers for programmatic SEO pages.
 *
 *   /cheap-flights/new-york-to-los-angeles   route page (city-level slugs)
 *   /flights-to/los-angeles                  destination page
 *   /flights-from/new-york                   origin page
 *   /airports/jfk                            airport page
 *   /airlines/delta-air-lines                airline page
 *   /destinations/los-angeles                travel guide
 */
import { slugify } from "@/lib/utils";
import { AIRPORTS, getAirport } from "@/data/airports";
import type { Airport } from "@/lib/flights/types";

export function citySlug(a: Pick<Airport, "city">): string {
  return slugify(a.city);
}

/** City slug → airports in that city, largest first. */
const cityIndex: Map<string, Airport[]> = (() => {
  const m = new Map<string, Airport[]>();
  for (const a of AIRPORTS) {
    const key = citySlug(a);
    const list = m.get(key) ?? [];
    list.push(a);
    m.set(key, list);
  }
  for (const list of m.values()) list.sort((x, y) => y.size - x.size || x.iata.localeCompare(y.iata));
  return m;
})();

export function airportsForCitySlug(slug: string): Airport[] {
  return cityIndex.get(slug) ?? [];
}

/** Primary (largest) airport for a city slug, or by IATA code. */
export function primaryAirportForSlug(slug: string): Airport | undefined {
  const byCode = getAirport(slug.toUpperCase());
  if (byCode && slug.length === 3) return byCode;
  return airportsForCitySlug(slug)[0];
}

export function allCitySlugs(): string[] {
  return Array.from(cityIndex.keys());
}

export function routeSlug(origin: string | Airport, destination: string | Airport): string {
  const o = typeof origin === "string" ? getAirport(origin) : origin;
  const d = typeof destination === "string" ? getAirport(destination) : destination;
  if (!o || !d) return "";
  return `${citySlug(o)}-to-${citySlug(d)}`;
}

export function routePath(origin: string | Airport, destination: string | Airport): string {
  return `/cheap-flights/${routeSlug(origin, destination)}`;
}

/** Parse "new-york-to-los-angeles" → primary airports. Handles cities containing "to" safely by trying every split. */
export function parseRouteSlug(slug: string): { origin: Airport; destination: Airport } | null {
  const parts = slug.split("-to-");
  if (parts.length < 2) return null;
  for (let i = 1; i < parts.length; i++) {
    const o = parts.slice(0, i).join("-to-");
    const d = parts.slice(i).join("-to-");
    const origin = primaryAirportForSlug(o);
    const destination = primaryAirportForSlug(d);
    if (origin && destination && origin.iata !== destination.iata) return { origin, destination };
  }
  return null;
}

export function airportPath(a: string | Airport): string {
  const code = typeof a === "string" ? a : a.iata;
  return `/airports/${code.toLowerCase()}`;
}

export function flightsToPath(a: string | Airport): string {
  const ap = typeof a === "string" ? getAirport(a) : a;
  return ap ? `/flights-to/${citySlug(ap)}` : "/flights-to";
}

export function flightsFromPath(a: string | Airport): string {
  const ap = typeof a === "string" ? getAirport(a) : a;
  return ap ? `/flights-from/${citySlug(ap)}` : "/flights-from";
}

export function airlinePath(slug: string): string {
  return `/airlines/${slug}`;
}

export function destinationPath(slug: string): string {
  return `/destinations/${slug}`;
}

export function articlePath(slug: string): string {
  return `/travel-guides/${slug}`;
}
