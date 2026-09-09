import Link from "next/link";
import { ArrowRight, PlaneLanding, PlaneTakeoff } from "lucide-react";
import { SearchForm } from "@/components/search";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/seo/PageHeader";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { RouteLinks, type RouteLinkItem } from "@/components/seo/RouteLinks";
import { JumpNav } from "@/components/seo/JumpNav";
import { groupBy, regionForAirport, regionLabel, INTERNATIONAL_REGIONS } from "@/components/seo/geo-groups";
import { buildMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { citySlug, flightsFromPath, flightsToPath, routePath } from "@/lib/seo/slugs";
import { lowestRouteFare } from "@/lib/flights/route-info";
import { DOMESTIC_ROUTES, INTERNATIONAL_ROUTES, POPULAR_ROUTES } from "@/data/routes";
import { getAirport } from "@/data/airports";
import type { RouteDef } from "@/data/types";
import type { Airport } from "@/lib/flights/types";
import { formatCount } from "@/components/seo/seo-text";

export const revalidate = 21600;

const PATH = "/cheap-flights";
const DESCRIPTION = "Browse cheap flights on the most popular US domestic and international routes. See typical fares, nonstop airlines, the cheapest month to fly and book in minutes.";

export const metadata = buildMetadata({
  title: "Cheap Flights on Popular US Routes",
  description: DESCRIPTION,
  path: PATH,
});

interface ResolvedRoute {
  def: RouteDef;
  origin: Airport;
  destination: Airport;
}

function resolveRoutes(list: RouteDef[]): ResolvedRoute[] {
  const out: ResolvedRoute[] = [];
  for (const def of list) {
    const origin = getAirport(def.origin);
    const destination = getAirport(def.destination);
    if (origin && destination) out.push({ def, origin, destination });
  }
  return out;
}

function CompactRouteList({ routes }: { routes: ResolvedRoute[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2 lg:grid-cols-3">
      {routes.map((r) => (
        <li key={`${r.origin.iata}-${r.destination.iata}`}>
          <Link href={routePath(r.origin, r.destination)} className="group inline-flex items-center gap-1.5 py-0.5 text-slate-700 hover:text-ocean-700">
            <span className="group-hover:underline underline-offset-4">
              {r.origin.city} to {r.destination.city}
            </span>
            <span className="text-xs text-slate-500">
              {r.origin.iata}–{r.destination.iata}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function CheapFlightsHubPage() {
  const popular = resolveRoutes(POPULAR_ROUTES);
  const pricedCount = Math.min(popular.length, 24);
  const fares = await Promise.all(popular.slice(0, pricedCount).map((r) => lowestRouteFare(r.origin.iata, r.destination.iata)));
  const popularItems: RouteLinkItem[] = popular.map((r, i) => ({ origin: r.origin, destination: r.destination, price: fares[i]?.price ?? null, subtitle: `${r.origin.iata} → ${r.destination.iata} · ${r.def.category === "domestic" ? "Domestic" : "International"}` }));

  const domestic = resolveRoutes(DOMESTIC_ROUTES);
  const domesticByCity = groupBy(domestic, (r) => citySlug(r.origin));
  const domesticGroups = Array.from(domesticByCity.entries())
    .map(([slug, routes]) => ({ slug, city: routes[0].origin.city, airport: routes[0].origin, routes: [...routes].sort((a, b) => a.destination.city.localeCompare(b.destination.city)) }))
    .sort((a, b) => b.routes.length - a.routes.length || a.city.localeCompare(b.city));

  const international = resolveRoutes(INTERNATIONAL_ROUTES);
  const intlByRegion = groupBy(international, (r) => regionForAirport(r.destination));
  const intlGroups = INTERNATIONAL_REGIONS.filter((region) => intlByRegion.has(region)).map((region) => ({
    region,
    routes: [...(intlByRegion.get(region) ?? [])].sort((a, b) => a.destination.city.localeCompare(b.destination.city) || a.origin.city.localeCompare(b.origin.city)),
  }));

  const totalRoutes = domestic.length + international.length;

  return (
    <>
      <JsonLd data={webPageJsonLd({ name: "Cheap flights on popular routes", description: DESCRIPTION, path: PATH, type: "CollectionPage" })} />
      <PageHeader
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Cheap flights", path: PATH },
        ]}
        title="Cheap flights on popular routes"
        lead={`Route-by-route fare guides for ${formatCount(totalRoutes)} city pairs: nonstop airlines, typical flight times, the cheapest month to fly and live prices for the next six months.`}
      >
        <SearchForm variant="compact" />
      </PageHeader>

      <section className="container-page py-12">
        <SectionHeading title="Most popular US routes" description="The city pairs Air1 travelers search most. Fares are the lowest round trip per traveler over the next six months, taxes and fees included." />
        <div className="mt-6">
          <RouteLinks routes={popularItems} ariaLabel="Most popular routes" />
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container-page grid gap-4 sm:grid-cols-2">
          <Link href="/flights-to" className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-5 shadow-card transition hover:border-ocean-300 hover:shadow-card-hover">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
              <PlaneLanding className="h-6 w-6" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-navy-900 group-hover:underline">Browse flights by destination</span>
              <span className="block text-sm text-slate-600">Every city we fly to, grouped by region, with fares from major US airports.</span>
            </span>
            <ArrowRight className="h-5 w-5 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-ocean-600" aria-hidden />
          </Link>
          <Link href="/flights-from" className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-5 shadow-card transition hover:border-ocean-300 hover:shadow-card-hover">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
              <PlaneTakeoff className="h-6 w-6" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-navy-900 group-hover:underline">Browse flights by departure city</span>
              <span className="block text-sm text-slate-600">Start from your home airport and see where the cheapest fares go.</span>
            </span>
            <ArrowRight className="h-5 w-5 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-ocean-600" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="container-page py-12">
        <SectionHeading id="domestic" title="Domestic routes" description={`${formatCount(domestic.length)} routes within the United States, grouped by departure city. Each page covers both directions.`} />
        <JumpNav className="mt-5" label="Jump to departure city" items={domesticGroups.slice(0, 16).map((g) => ({ id: `from-${g.slug}`, label: g.city }))} />
        <div className="mt-8 space-y-8">
          {domesticGroups.map((g) => (
            <div key={g.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 id={`from-${g.slug}`} className="scroll-mt-24 text-lg">
                  From {g.city}
                </h3>
                <Link href={flightsFromPath(g.airport)} className="text-sm font-semibold text-ocean-700 hover:underline">
                  All flights from {g.city}
                </Link>
              </div>
              <div className="mt-3">
                <CompactRouteList routes={g.routes} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container-page">
          <SectionHeading id="international" title="International routes from the US" description={`${formatCount(international.length)} routes from US gateways to Canada, Mexico, the Caribbean, Europe, Asia and beyond, grouped by destination region.`} />
          <JumpNav className="mt-5" label="Jump to region" items={intlGroups.map((g) => ({ id: `region-${g.region}`, label: regionLabel(g.region) }))} />
          <div className="mt-8 space-y-8">
            {intlGroups.map((g) => (
              <div key={g.region} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6">
                <h3 id={`region-${g.region}`} className="scroll-mt-24 text-lg">
                  {regionLabel(g.region)}
                </h3>
                <div className="mt-3">
                  <CompactRouteList routes={g.routes} />
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  Looking for a specific city?{" "}
                  <Link href={flightsToPath(g.routes[0].destination)} className="font-medium text-ocean-700 hover:underline">
                    Flights to {g.routes[0].destination.city}
                  </Link>{" "}
                  and other destinations in {regionLabel(g.region)} are on the{" "}
                  <Link href="/flights-to" className="font-medium text-ocean-700 hover:underline">
                    destinations index
                  </Link>
                  .
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
