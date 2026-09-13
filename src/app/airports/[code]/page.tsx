import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, Clock, Globe2, MapPin, Plane, Ruler, Users } from "lucide-react";
import { SearchForm } from "@/components/search";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import { PageHeader } from "@/components/seo/PageHeader";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { FactList, type FactItem } from "@/components/seo/FactList";
import { RouteLinks, type RouteLinkItem } from "@/components/seo/RouteLinks";
import { LinkCardGrid, type LinkCardItem } from "@/components/seo/LinkCardGrid";
import { AirlineLogo } from "@/components/results/AirlineLogo";
import { SIZE_TIER_LABELS, stateName, placeLabelLong } from "@/components/seo/geo-groups";
import { fitDescription, fitTitle, formatUtcOffset, joinNames } from "@/components/seo/seo-text";
import { buildMetadata } from "@/lib/seo/metadata";
import { airportJsonLd, faqPageJsonLd } from "@/lib/seo/jsonld";
import { airlinePath, airportPath, destinationPath, flightsFromPath, flightsToPath } from "@/lib/seo/slugs";
import { lowestRouteFare, nonstopCarriers } from "@/lib/flights/route-info";
import { currentTzOffsetMinutes } from "@/lib/flights/geo";
import { AIRLINES, type AirlineProfile } from "@/data/airlines";
import { AIRPORTS, AIRPORTS_BY_METRO, METRO_LABELS, getAirport } from "@/data/airports";
import { getRoutesFrom, getRoutesTo } from "@/data/routes";
import { getDestinationByAirport } from "@/data/destinations";
import type { FAQ } from "@/data/types";

export const revalidate = 21600;
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ code: string }>;
}

export function generateStaticParams(): { code: string }[] {
  return AIRPORTS.map((a) => ({ code: a.iata.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const a = getAirport(code);
  if (!a) return { title: "Airport not found", robots: { index: false, follow: false } };
  const title = fitTitle([`${a.name} (${a.iata}) — Flights & Airport Guide`, `${a.city} Airport (${a.iata}) Flights & Guide`, `${a.iata} Airport Guide`]);
  const description = fitDescription([
    `${a.name} (${a.iata}) in ${a.city}, ${placeLabelLong(a)}: airlines, popular nonstop routes, time zone and practical facts.`,
    "Compare cheap flights to and from " + a.iata + " with 24/7 US-based support.",
  ]);
  return buildMetadata({ title, description, path: airportPath(a), keywords: [`${a.iata} airport`, `${a.name}`, `flights from ${a.iata}`, `flights to ${a.iata}`] });
}

export default async function AirportPage({ params }: PageProps) {
  const { code } = await params;
  if (code !== code.toLowerCase()) permanentRedirect(`/airports/${code.toLowerCase()}`);
  const a = getAirport(code);
  if (!a) notFound();
  const path = airportPath(a);
  const isUS = ["US", "PR", "VI", "GU"].includes(a.countryCode);
  const offset = currentTzOffsetMinutes(a.tz);
  const guide = getDestinationByAirport(a.iata);
  const metroSiblings = a.metro ? (AIRPORTS_BY_METRO[a.metro] ?? []).filter((x) => x.iata !== a.iata) : [];

  const from = getRoutesFrom(a.iata).sort((x, y) => Number(Boolean(y.popular)) - Number(Boolean(x.popular)));
  const to = getRoutesTo(a.iata).sort((x, y) => Number(Boolean(y.popular)) - Number(Boolean(x.popular)));
  const pricedFrom = from.slice(0, 6);
  const fares = await Promise.all(pricedFrom.map((r) => lowestRouteFare(r.origin, r.destination)));
  const toItems = (list: typeof from, priced: boolean): RouteLinkItem[] =>
    list
      .slice(0, 9)
      .map((r, i) => {
        const o = getAirport(r.origin);
        const d = getAirport(r.destination);
        return o && d ? ({ origin: o, destination: d, price: priced && i < pricedFrom.length ? fares[i]?.price ?? null : null } as RouteLinkItem) : null;
      })
      .filter((x): x is RouteLinkItem => x !== null);

  const hubAirlines = AIRLINES.filter((al) => al.hubs.includes(a.iata));
  const servingMap = new Map<string, AirlineProfile>();
  for (const al of hubAirlines) servingMap.set(al.iata, al);
  for (const r of from.slice(0, 12)) {
    const d = getAirport(r.destination);
    if (d) for (const al of nonstopCarriers(a, d)) servingMap.set(al.iata, al);
  }
  const serving = Array.from(servingMap.values()).slice(0, 16);
  const airlineItems: LinkCardItem[] = serving.map((al) => ({
    key: al.iata,
    href: airlinePath(al.slug),
    title: al.name,
    subtitle: al.hubs.includes(a.iata) ? "Hub airline" : al.lowCost ? "Low-cost carrier" : "Nonstop routes",
    leading: <AirlineLogo iata={al.iata} size={32} />,
  }));

  const facts: FactItem[] = [
    { label: "IATA / ICAO", value: `${a.iata}${a.icao ? ` / ${a.icao}` : ""}`, icon: Plane },
    { label: "City", value: `${a.city}, ${placeLabelLong(a)}`, icon: MapPin },
    { label: "Time zone", value: `${a.tz.replace(/_/g, " ")} (${formatUtcOffset(offset)})`, icon: Clock },
    { label: "Airport size", value: SIZE_TIER_LABELS[a.size], icon: Users },
    { label: "Coordinates", value: `${a.lat.toFixed(3)}, ${a.lon.toFixed(3)}`, icon: Ruler },
    { label: a.metro ? "Metro area" : "Country", value: a.metro ? (METRO_LABELS[a.metro] ?? a.metro) : a.country, icon: Globe2 },
  ];

  const faqs: FAQ[] = [
    {
      question: `Which airlines fly from ${a.iata}?`,
      answer: serving.length
        ? `${joinNames(serving.slice(0, 5).map((al) => al.name))}${serving.length > 5 ? " and others" : ""} serve ${a.name}.${hubAirlines.length ? ` ${joinNames(hubAirlines.map((al) => al.name))} ${hubAirlines.length === 1 ? "uses" : "use"} ${a.iata} as a hub, so expect the widest choice of nonstop routes from ${hubAirlines.length === 1 ? "it" : "them"}.` : ""}`
        : `Several airlines serve ${a.name}. Search a route to see every carrier and fare.`,
    },
    {
      question: `Is ${a.iata} a hub airport?`,
      answer: hubAirlines.length
        ? `Yes — ${a.name} is a hub or focus city for ${joinNames(hubAirlines.map((al) => al.name))}, which means frequent departures and many connecting itineraries pass through it.`
        : `${a.name} is ${a.size >= 4 ? "a large airport with many nonstop routes but not a major connecting hub" : "a smaller airport served mainly by nonstop flights to airline hubs"}. Most long-distance trips connect through a hub such as ${joinNames(Array.from(new Set(from.slice(0, 4).map((r) => r.destination))).slice(0, 3))}.`,
    },
    {
      question: `How early should I arrive at ${a.iata}?`,
      answer: `Plan on two hours before a domestic departure and three hours before an international one${a.size >= 4 ? " — security lines at large airports like " + a.iata + " can stretch to 30 minutes or more at peak times" : ""}. TSA PreCheck or CLEAR typically saves 15–30 minutes${isUS ? "" : " (US programs don't apply abroad, but many airports have fast-track lanes)"}.`,
    },
    ...(metroSiblings.length
      ? [
          {
            question: `What other airports are near ${a.city}?`,
            answer: `${joinNames(metroSiblings.map((s) => `${s.name} (${s.iata})`))} also serve the ${a.city} area. Fares can differ by $50 or more between them, so compare all of them — our search shows every airport by name.`,
          },
        ]
      : []),
  ];

  return (
    <>
      <JsonLd data={[airportJsonLd({ name: a.name, iata: a.iata, city: a.city, countryCode: a.countryCode, lat: a.lat, lon: a.lon, path }), faqPageJsonLd(faqs)]} />
      <PageHeader
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Airports", path: "/airports" },
          { name: `${a.city} (${a.iata})`, path },
        ]}
        eyebrow={`${SIZE_TIER_LABELS[a.size]} · ${a.city}, ${placeLabelLong(a)}`}
        title={`${a.name} (${a.iata})`}
        lead={
          <>
            {hubAirlines.length ? `A hub for ${joinNames(hubAirlines.map((al) => al.name))}. ` : ""}
            Compare flights from and to {a.iata}, see which airlines fly nonstop, and find the cheapest month to travel.
          </>
        }
      >
        <SearchForm variant="compact" initial={{ origin: a.iata }} />
      </PageHeader>

      <section className="container-page py-12">
        <SectionHeading title={`${a.iata} at a glance`} />
        <FactList className="mt-5" items={facts} columns={3} />
      </section>

      {(from.length > 0 || to.length > 0) && (
        <section className="bg-white py-12">
          <div className="container-page grid gap-10 lg:grid-cols-2">
            {from.length > 0 && (
              <div>
                <SectionHeading as="h2" title={`Popular routes from ${a.iata}`} link={{ href: flightsFromPath(a), label: "All routes" }} />
                <RouteLinks className="mt-5" routes={toItems(from, true)} columns={2} ariaLabel={`Routes from ${a.iata}`} />
              </div>
            )}
            {to.length > 0 && (
              <div>
                <SectionHeading as="h2" title={`Popular routes to ${a.iata}`} link={{ href: flightsToPath(a), label: "All routes" }} />
                <RouteLinks className="mt-5" routes={toItems(to, false)} columns={2} ariaLabel={`Routes to ${a.iata}`} />
              </div>
            )}
          </div>
        </section>
      )}

      <section className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div>
            <SectionHeading as="h2" title={`Airlines at ${a.iata}`} description="Hub airlines first, then carriers with nonstop routes from this airport." />
            {airlineItems.length ? <LinkCardGrid className="mt-5" items={airlineItems} columns={2} ariaLabel={`Airlines at ${a.iata}`} /> : <p className="mt-4 text-sm text-slate-500">Search a route to see the airlines serving {a.iata}.</p>}
          </div>
          <div className="space-y-4">
            {metroSiblings.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <h3 className="text-base">Other {a.city}-area airports</h3>
                <ul className="mt-3 space-y-2">
                  {metroSiblings.map((s) => (
                    <li key={s.iata}>
                      <Link href={airportPath(s)} className="flex items-center justify-between text-sm font-medium text-navy-900 hover:underline">
                        <span>
                          {s.name} <span className="text-slate-500">({s.iata})</span>
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-500" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {guide && (
              <Link href={destinationPath(guide.slug)} className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:border-ocean-300 hover:shadow-card-hover">
                <p className="text-xs font-semibold uppercase tracking-wide text-ocean-700">Destination guide</p>
                <p className="mt-1 font-display text-lg font-bold text-navy-900 group-hover:underline">{guide.city}: {guide.tagline}</p>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{guide.summary}</p>
              </Link>
            )}
            <div className="rounded-2xl bg-navy-900 p-5 text-white">
              <p className="font-display text-lg font-bold">Flying into {a.iata}?</p>
              <p className="mt-1 text-sm text-white/75">See every airline and fare to {a.city} from your home airport.</p>
              <Link href={flightsToPath(a)} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ocean-200 hover:underline">
                Flights to {a.city} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl sm:text-3xl">{a.iata}: common questions</h2>
          <div className="mt-6">
            <FaqAccordion items={faqs} idPrefix="airport-faq" />
          </div>
        </div>
      </section>
    </>
  );
}
