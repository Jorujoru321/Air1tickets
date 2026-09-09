import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { CalendarDays, Clock, Globe2, MapPin, Plane, Sun, ThermometerSun, Lightbulb } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { FactList, type FactItem } from "@/components/seo/FactList";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import { JumpNav } from "@/components/seo/JumpNav";
import { LinkCardGrid, type LinkCardItem } from "@/components/seo/LinkCardGrid";
import { DestinationArt } from "@/components/marketing/DestinationArt";
import { DestinationCard } from "@/components/marketing/DestinationCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqPageJsonLd, touristDestinationJsonLd } from "@/lib/seo/jsonld";
import { airportPath, articlePath, destinationPath, flightsToPath, routePath } from "@/lib/seo/slugs";
import { buildSearchUrl, defaultTripDates } from "@/lib/flights/search-params";
import { lowestRouteFare } from "@/lib/flights/route-info";
import { DESTINATIONS, getDestination } from "@/data/destinations";
import { getAirport } from "@/data/airports";
import { REGION_LABELS } from "@/data/types";
import { ARTICLES } from "@/content/articles";
import { formatDuration, formatMoney } from "@/lib/utils";

export const revalidate = 21600;
export const dynamicParams = false;

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const d = getDestination(slug);
  if (!d) return {};
  const from = Math.min(...d.typicalFares.map((f) => f.price));
  const title = `${d.city} Travel Guide — Cheap Flights${Number.isFinite(from) ? ` from ${formatMoney(from)}` : ""}, Best Time to Visit`;
  return buildMetadata({ title, description: d.summary, path: destinationPath(d.slug), keywords: d.keywords });
}

export default async function DestinationPage({ params }: PageProps) {
  const { slug } = await params;
  if (slug !== slug.toLowerCase()) permanentRedirect(destinationPath(slug.toLowerCase()));
  const d = getDestination(slug);
  if (!d) notFound();
  const path = destinationPath(d.slug);
  const airports = d.airports.map((c) => getAirport(c)).filter((a): a is NonNullable<typeof a> => Boolean(a));
  const primary = airports[0];
  const location = d.countryCode === "US" ? `${d.city}, ${d.state}` : `${d.city}, ${d.country}`;
  const { depart, ret } = defaultTripDates();

  // Live lowest fares from the provider's calendar for each "typical fare" origin.
  const live = primary ? await Promise.all(d.typicalFares.map((f) => lowestRouteFare(f.origin, primary.iata))) : [];
  const fareRows = d.typicalFares
    .map((f, i) => {
      const o = getAirport(f.origin);
      if (!o || !primary) return null;
      const liveFare = live[i];
      const time = d.flightTimes.find((t) => t.origin === f.origin)?.minutes ?? null;
      return {
        origin: o,
        typical: f.price,
        live: liveFare?.price ?? null,
        liveDate: liveFare?.date ?? null,
        time,
        routeHref: routePath(o, primary),
        searchHref: buildSearchUrl({ origin: o.iata, destination: primary.iata, departDate: liveFare?.date ?? depart, returnDate: liveFare?.date ? undefined : ret, passengers: { adults: 1, children: 0, infants: 0 }, cabin: "economy" }),
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
  const bestLive = fareRows.map((r) => r.live).filter((p): p is number => p !== null);
  const lowestLive = bestLive.length ? Math.min(...bestLive) : null;
  const lowestTypical = Math.min(...d.typicalFares.map((f) => f.price));
  const shortest = d.flightTimes.length ? d.flightTimes.reduce((a, b) => (a.minutes < b.minutes ? a : b)) : null;

  const facts: FactItem[] = [
    { label: "Airports", value: airports.map((a) => `${a.iata} ${a.name}`).join(" · ") || d.airports.join(", "), icon: Plane },
    { label: "Region", value: REGION_LABELS[d.region], icon: Globe2 },
    { label: "Best time to visit", value: d.bestTimeToVisit.split(/(?<=\.)\s/)[0], icon: CalendarDays },
    ...(shortest ? [{ label: "Shortest flight", value: `${formatDuration(shortest.minutes)} from ${getAirport(shortest.origin)?.city ?? shortest.origin}`, icon: Clock }] : []),
    { label: "Round trips from", value: lowestLive ? `${formatMoney(lowestLive)} (live)` : formatMoney(lowestTypical), icon: ThermometerSun },
    ...(primary ? [{ label: "Time zone", value: primary.tz.replace(/_/g, " "), icon: Sun }] : []),
  ];

  const articles = ARTICLES.filter((a) => a.relatedDestinations?.includes(d.slug)).slice(0, 3);
  const siblings = DESTINATIONS.filter((x) => x.slug !== d.slug && x.region === d.region).slice(0, 4);
  const more = siblings.length >= 4 ? siblings : [...siblings, ...DESTINATIONS.filter((x) => x.slug !== d.slug && x.popular && !siblings.includes(x))].slice(0, 4);
  const airportLinks: LinkCardItem[] = airports.map((a) => ({ href: airportPath(a), title: `${a.name} (${a.iata})`, subtitle: `${a.city} · ${a.size >= 4 ? "Large hub" : a.size === 3 ? "Medium airport" : "Small airport"}`, aside: a.iata }));
  const jump = [
    { id: "overview", label: "Overview" },
    { id: "fares", label: "Flights & fares" },
    { id: "highlights", label: "Highlights" },
    { id: "weather", label: "Weather" },
    { id: "tips", label: "Tips" },
    { id: "faq", label: "FAQ" },
  ];
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Destinations", path: "/destinations" },
    { name: d.city, path },
  ];

  return (
    <>
      <JsonLd data={[touristDestinationJsonLd({ name: location, description: d.summary, path, countryCode: d.countryCode }), faqPageJsonLd(d.faqs)]} />

      <header className="relative isolate overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 -z-10">
          <DestinationArt theme={d.heroTheme} gradient={d.gradient} seed={d.slug} priority className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/40 to-navy-900/20" aria-hidden />
        </div>
        <div className="container-page pb-10 pt-6 sm:pt-8">
          <Breadcrumbs items={crumbs} className="text-white/70 [&_a:hover]:text-white [&_span[aria-current]]:text-white" />
          <div className="mt-16 max-w-3xl sm:mt-24">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ocean-200">
              <MapPin className="h-4 w-4" aria-hidden /> {location}
            </p>
            <h1 className="mt-2 text-4xl text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">{d.city} travel guide</h1>
            <p className="mt-3 text-lg text-white/85 sm:text-xl">{d.tagline}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {primary && (
                <Button href={`/flights?to=${primary.iata}`} size="lg">
                  Find flights to {d.city}
                </Button>
              )}
              <Button href="#fares" variant="secondary" size="lg" className="bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20">
                See fares from {formatMoney(lowestLive ?? lowestTypical)}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200/80 bg-white">
        <div className="container-page py-4">
          <JumpNav items={jump} />
        </div>
      </div>

      <section id="overview" className="container-page scroll-mt-24 py-12">
        <FactList items={facts} columns={3} />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div className="prose-air1 max-w-3xl">
            <h2 className="mt-0">About {d.city}</h2>
            {d.overview.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
            <h3>Best time to visit</h3>
            <p>{d.bestTimeToVisit}</p>
            {d.neighborhoods?.length ? (
              <>
                <h3>Where to stay</h3>
                <p>Neighborhoods our travelers like: {d.neighborhoods.join(", ")}.</p>
              </>
            ) : null}
          </div>
          <aside className="space-y-4 lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Airports serving {d.city}</p>
              <ul className="mt-3 space-y-2">
                {airports.map((a) => (
                  <li key={a.iata}>
                    <Link href={airportPath(a)} className="flex items-center justify-between gap-3 text-sm text-navy-900 hover:text-ocean-700">
                      <span className="truncate">{a.name}</span>
                      <Badge tone="outline">{a.iata}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
              {primary && (
                <Link href={flightsToPath(primary)} className="mt-4 inline-block text-sm font-semibold text-ocean-700 hover:underline">
                  All flights to {d.city} →
                </Link>
              )}
            </div>
            {articles.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Read before you go</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {articles.map((a) => (
                    <li key={a.slug}>
                      <Link href={articlePath(a.slug)} className="text-navy-900 hover:text-ocean-700 hover:underline">
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section id="fares" className="scroll-mt-24 bg-white py-12">
        <div className="container-page">
          <SectionHeading title={`Flights to ${d.city}: typical round-trip fares`} description={`What economy round trips to ${primary ? primary.iata : d.city} usually cost from major US cities, alongside the lowest live fare we can see in the next 90 days. Prices are per traveler and include taxes.`} />
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[40rem] text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    From
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Flight time
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Typical fare
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Lowest live fare
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {fareRows.map((r) => (
                  <tr key={r.origin.iata} className="bg-white">
                    <td className="px-4 py-3">
                      <Link href={r.routeHref} className="font-semibold text-navy-900 hover:text-ocean-700 hover:underline">
                        {r.origin.city} ({r.origin.iata})
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.time ? formatDuration(r.time) : "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{formatMoney(r.typical)}</td>
                    <td className="px-4 py-3">
                      {r.live ? (
                        <span className="font-semibold text-success-700">
                          {formatMoney(r.live)} <span className="font-normal text-slate-500">· {r.liveDate}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={r.searchHref} className="text-sm font-semibold text-ocean-700 hover:underline">
                        Search dates →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500">Typical fares are editorial estimates for economy round trips booked 3–8 weeks out. Live fares refresh several times a day and are shown for the cheapest departure date we found.</p>
          <div className="mt-8">
            <SectionHeading as="h3" title={`Airports in ${d.city}`} />
            <LinkCardGrid className="mt-4" items={airportLinks} columns={3} ariaLabel={`Airports serving ${d.city}`} />
          </div>
        </div>
      </section>

      <section id="highlights" className="container-page scroll-mt-24 py-12">
        <SectionHeading title={`What to do in ${d.city}`} description="The places our editors send first-time visitors." />
        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {d.highlights.map((h, i) => (
            <li key={h.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ocean-50 font-display text-sm font-bold text-ocean-700">{i + 1}</span>
              <div>
                <p className="font-semibold text-navy-900">{h.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{h.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="weather" className="scroll-mt-24 bg-white py-12">
        <div className="container-page">
          <SectionHeading title={`${d.city} weather by season`} description="Average highs and lows in °F, with what each season means for fares and crowds." />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {d.weather.map((w) => (
              <div key={w.season} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-wide text-ocean-700">{w.season}</p>
                <p className="mt-2 font-display text-2xl font-extrabold text-navy-900">
                  {w.highF}° <span className="text-base font-semibold text-slate-400">/ {w.lowF}°</span>
                </p>
                <p className="mt-2 text-sm text-slate-600">{w.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tips" className="container-page scroll-mt-24 py-12">
        <div className="rounded-2xl border border-sunrise-200 bg-sunrise-50 p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-2xl">
            <Lightbulb className="h-6 w-6 text-sunrise-600" aria-hidden /> Travel tips for {d.city}
          </h2>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {d.travelTips.map((t) => (
              <li key={t.slice(0, 40)} className="flex gap-2 text-sm text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sunrise-500" aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 bg-white py-12">
        <div className="container-page">
          <SectionHeading title={`${d.city} flights: frequently asked questions`} />
          <FaqAccordion className="mt-6" items={d.faqs} idPrefix="dest-faq" />
        </div>
      </section>

      <section className="container-page py-12">
        <SectionHeading title={siblings.length >= 2 ? `More in ${REGION_LABELS[d.region]}` : "More destinations"} link={{ href: "/destinations", label: "All destinations" }} />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {more.map((x) => (
            <DestinationCard key={x.slug} d={x} />
          ))}
        </div>
      </section>
    </>
  );
}
