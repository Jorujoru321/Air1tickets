import "server-only";
import type { Airport } from "@/lib/flights/types";
import type { RouteDef } from "@/data/types";
import { AIRPORTS, getAirport } from "@/data/airports";
import { ALL_DIRECTIONAL_ROUTES, getRoutesFrom, getRoutesTo } from "@/data/routes";
import { DESTINATIONS } from "@/data/destinations";
import { airportsForCitySlug, citySlug } from "@/lib/seo/slugs";

/** A city as used by /flights-to and /flights-from: its airports (largest first). */
export interface CityEntry {
  slug: string;
  city: string;
  primary: Airport;
  airports: Airport[];
}

const cityMap: Map<string, CityEntry> = (() => {
  const m = new Map<string, CityEntry>();
  for (const a of AIRPORTS) {
    const slug = citySlug(a);
    if (m.has(slug)) continue;
    const airports = airportsForCitySlug(slug);
    m.set(slug, { slug, city: airports[0].city, primary: airports[0], airports });
  }
  return m;
})();

export function getCity(slug: string): CityEntry | undefined {
  return cityMap.get(slug.toLowerCase());
}

export function allCities(): CityEntry[] {
  return Array.from(cityMap.values());
}

/** Cities that appear as a destination in the curated routes or have a guide. */
export function destinationCitySlugs(): string[] {
  const slugs = new Set<string>();
  for (const r of ALL_DIRECTIONAL_ROUTES) {
    const a = getAirport(r.destination);
    if (a) slugs.add(citySlug(a));
  }
  for (const d of DESTINATIONS) {
    const a = getAirport(d.airports[0]);
    if (a) slugs.add(citySlug(a));
  }
  return Array.from(slugs);
}

/** US cities that appear as an origin in the curated routes. */
export function originCitySlugs(): string[] {
  const slugs = new Set<string>();
  for (const r of ALL_DIRECTIONAL_ROUTES) {
    const a = getAirport(r.origin);
    if (a && ["US", "PR", "VI", "GU"].includes(a.countryCode)) slugs.add(citySlug(a));
  }
  return Array.from(slugs);
}

function dedupe(routes: RouteDef[], key: (r: RouteDef) => string): RouteDef[] {
  const seen = new Set<string>();
  const out: RouteDef[] = [];
  for (const r of routes) {
    const k = key(r);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out.sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)));
}

/** Curated routes arriving at any airport of the city, one per origin city, popular first. */
export function routesToCity(entry: CityEntry): RouteDef[] {
  const all = entry.airports.flatMap((a) => getRoutesTo(a.iata));
  return dedupe(all, (r) => citySlug(getAirport(r.origin)!));
}

/** Curated routes departing any airport of the city, one per destination city, popular first. */
export function routesFromCity(entry: CityEntry): RouteDef[] {
  const all = entry.airports.flatMap((a) => getRoutesFrom(a.iata));
  return dedupe(all, (r) => citySlug(getAirport(r.destination)!));
}

export function cityLocationLabel(a: Airport): string {
  return a.countryCode === "US" && a.state ? a.state : a.country;
}
