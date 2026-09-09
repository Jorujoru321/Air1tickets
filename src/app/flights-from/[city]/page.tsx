import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SearchForm } from "@/components/search";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import { PageHeader } from "@/components/seo/PageHeader";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { RouteLinks, type RouteLinkItem } from "@/components/seo/RouteLinks";
import { LinkCardGrid, type LinkCardItem } from "@/components/seo/LinkCardGrid";
import { AirlineLogo } from "@/components/results/AirlineLogo";
import { fitDescription, fitTitle, joinNames } from "@/components/seo/seo-text";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { airportPath, flightsFromPath } from "@/lib/seo/slugs";
import { lowestRouteFare } from "@/lib/flights/route-info";
import { cityLocationLabel, getCity, originCitySlugs, routesFromCity } from "@/lib/seo/city-pages";
import { AIRLINES } from "@/data/airlines";
import { getAirport } from "@/data/airports";
import type { FAQ } from "@/data/types";
import { formatMoney } from "@/lib/utils";

export const revalidate = 21600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ city: string }>;
}

export function generateStaticParams(): { city: string }[] {
  return originCitySlugs().map((city) => ({ city }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const entry = getCity(city);
  if (!entry) return { title: "City not found", robots: { index: false, follow: false } };
  const routes = routesFromCity(entry).slice(0, 3);
  const fares = await Promise.all(routes.map((r) => lowestRouteFare(r.origin, r.destination)));
  const min = fares.filter(Boolean).map((f) => f!.price).sort((a, b) => a - b)[0];
  const title = fitTitle([`Cheap Flights from ${entry.city}${min ? ` from ${formatMoney(min)}` : ""} — Deals & Routes`, `Cheap Flights from ${entry.city}${min ? ` from ${formatMoney(min)}` : ""}`, `Cheap Flights from ${entry.city}`]);
  const description = fitDescription([
    `Find cheap flights from ${entry.city} (${entry.airports.map((a) => a.iata).join(", ")}) to ${joinNames(routes.map((r) => getAirport(r.destination)?.city ?? r.destination))} and 50+ more cities.`,
    min ? `Round trips from ${formatMoney(min)}, taxes and fees included.` : "Compare airlines, fares by month and the best day to fly.",
    "24/7 US-based support.",
  ]);
  return buildMetadata({ title, description, path: flightsFromPath(entry.primary), keywords: [`flights from ${entry.city}`, `cheap flights from ${entry.city}`, `${entry.primary.iata} departures`] });
}

export default async function FlightsFromCityPage({ params }: PageProps) {
  const { city } = await params;
  const entry = getCity(city);
  if (!entry) notFound();
  const { primary, airports } = entry;
  const path = flightsFromPath(primary);
  const routes = routesFromCity(entry);
  const priced = routes.slice(0, 9);
  const fares = await Promise.all(priced.map((r) => lowestRouteFare(r.origin, r.destination)));
  const build = (list: typeof routes, offset: number): RouteLinkItem[] =>
    list
      .map((r, i) => {
        const o = getAirport(r.origin);
        const d = getAirport(r.destination);
        const idx = offset + i;
        return o && d ? ({ origin: o, destination: d, price: idx < priced.length ? fares[idx]?.price ?? null : null } as RouteLinkItem) : null;
      })
      .filter((x): x is RouteLinkItem => x !== null);
  const domestic = routes.filter((r) => r.category === "domestic");
  const international = routes.filter((r) => r.category === "international");
  const minFare = fares.filter(Boolean).map((f) => f!.price).sort((a, b) => a - b)[0];
  const hubAirlines = AIRLINES.filter((al) => al.hubs.some((h) => airports.some((a) => a.iata === h)));
  const airportItems: LinkCardItem[] = airports.map((a) => ({
    key: a.iata,
    href: airportPath(a),
    title: `${a.name} (${a.iata})`,
    subtitle: hubAirlines.filter((al) => al.hubs.includes(a.iata)).length ? `Hub for ${joinNames(hubAirlines.filter((al) => al.hubs.includes(a.iata)).slice(0, 3).map((al) => al.name))}` : a.size >= 4 ? "Major airport" : "Regional airport",
    leading: (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-xs font-bold text-white" aria-hidden>
        {a.iata}
      </span>
    ),
  }));

  const faqs: FAQ[] = [
    {
      question: `Which airlines fly from ${entry.city}?`,
      answer: hubAirlines.length
        ? `${joinNames(hubAirlines.slice(0, 4).map((a) => a.name))} ${hubAirlines.length === 1 ? "operates" : "operate"} a hub or focus city in ${entry.city}, which means plenty of nonstop routes and competitive fares. Most other US airlines fly there too; each route page lists the carriers for that city pair.`
        : `${entry.city} is served by most major US airlines with nonstop and one-stop flights. Each route page lists the airlines flying that city pair.`,
    },
    {
      question: `What is the cheapest flight from ${entry.city}?`,
      answer: minFare
        ? `Among the popular routes we track, the lowest round-trip fare from ${entry.city} over the next three months is ${formatMoney(minFare)} per traveler including taxes and fees. Short domestic hops are usually the cheapest; see the deals page for the best dates.`
        : `Fares change daily. Use the deals page to see the cheapest dates from ${entry.city} over the next 90 days, or set a price alert for a specific route.`,
    },
    {
      question: airports.length > 1 ? `Which ${entry.city} airport is cheapest to fly from?` : `How early should I get to ${primary.iata}?`,
      answer:
        airports.length > 1
          ? `Fares differ between ${joinNames(airports.map((a) => a.iata))} depending on which airlines use each airport, so compare all of them. Low-cost carriers often concentrate at the secondary airport, while the largest airport has the most nonstop routes.`
          : `Arrive two hours before a domestic departure and three hours before an international one. TSA PreCheck members can usually cut that by 30 minutes at ${primary.iata}.`,
    },
  ];

  return (
    <>
      <JsonLd data={[webPageJsonLd({ name: `Flights from ${entry.city}`, description: `Cheap flights from ${entry.city} — routes, fares and airlines.`, path }), faqPageJsonLd(faqs)]} />
      <PageHeader
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Flights from", path: "/flights-from" },
          { name: entry.city, path },
        ]}
        eyebrow={`${cityLocationLabel(primary)} · ${airports.map((a) => a.iata).join(", ")}`}
        title={`Cheap flights from ${entry.city}`}
        lead={
          <>
            {minFare ? `Round trips from ${formatMoney(minFare)} per traveler, taxes and fees included. ` : ""}
            {routes.length} popular routes from {entry.city} with fares by month, airlines and the best day to fly.
          </>
        }
      >
        <SearchForm variant="compact" initial={{ origin: primary.iata }} />
      </PageHeader>

      <section className="container-page py-12">
        <SectionHeading title={`Popular domestic routes from ${entry.city}`} description="Lowest round-trip fares over the next three months where we track them, per traveler with taxes and fees." />
        {domestic.length ? <RouteLinks className="mt-6" routes={build(domestic, 0)} columns={3} ariaLabel={`Domestic routes from ${entry.city}`} /> : <p className="mt-4 text-sm text-slate-500">No curated domestic routes yet — search any US city above.</p>}
      </section>

      {international.length > 0 && (
        <section className="bg-white py-12">
          <div className="container-page">
            <SectionHeading title={`International flights from ${entry.city}`} description="Nonstop and one-stop routes to Mexico, the Caribbean, Europe and beyond." />
            <RouteLinks className="mt-6" routes={build(international, domestic.length)} columns={3} ariaLabel={`International routes from ${entry.city}`} />
          </div>
        </section>
      )}

      <section className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading title={`Airports in ${entry.city}`} as="h2" />
            <LinkCardGrid className="mt-5" items={airportItems} columns={2} ariaLabel={`Airports in ${entry.city}`} />
          </div>
          {hubAirlines.length > 0 && (
            <div>
              <SectionHeading title={`Hub airlines in ${entry.city}`} as="h2" description="Airlines with a hub or focus city here — expect the most nonstop routes and competitive fares from them." />
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {hubAirlines.slice(0, 9).map((c) => (
                  <li key={c.iata}>
                    <Link href={`/airlines/${c.slug}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 transition hover:border-ocean-300 hover:shadow-card">
                      <AirlineLogo iata={c.iata} size={32} />
                      <span className="truncate text-sm font-semibold text-navy-900">{c.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl sm:text-3xl">Flying from {entry.city}: common questions</h2>
          <div className="mt-6">
            <FaqAccordion items={faqs} idPrefix="origin-faq" />
          </div>
        </div>
      </section>
    </>
  );
}
