import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, CalendarDays, Globe2, Handshake, Luggage, Plane, Star, Ticket } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import { PageHeader } from "@/components/seo/PageHeader";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { FactList, type FactItem } from "@/components/seo/FactList";
import { RouteLinks, type RouteLinkItem } from "@/components/seo/RouteLinks";
import { AirlineLogo } from "@/components/results/AirlineLogo";
import { Badge } from "@/components/ui/Badge";
import { fitDescription, fitTitle, joinNames } from "@/components/seo/seo-text";
import { buildMetadata } from "@/lib/seo/metadata";
import { airlineJsonLd, faqPageJsonLd } from "@/lib/seo/jsonld";
import { airlinePath, airportPath } from "@/lib/seo/slugs";
import { nonstopCarriers } from "@/lib/flights/route-info";
import { CABIN_LABELS } from "@/lib/flights/types";
import { AIRLINES, ALLIANCE_LABELS, getAirlineBySlug } from "@/data/airlines";
import { getAirport } from "@/data/airports";
import { ALL_DIRECTIONAL_ROUTES } from "@/data/routes";
import type { FAQ } from "@/data/types";
import { formatMoney } from "@/lib/utils";

export const revalidate = 21600;
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return AIRLINES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const al = getAirlineBySlug(slug);
  if (!al) return { title: "Airline not found", robots: { index: false, follow: false } };
  const title = fitTitle([`${al.name} Flights — Fares, Bag Fees & Routes`, `${al.name} Flights & Fares`, `${al.name} Flights`]);
  const description = fitDescription([
    `Compare ${al.name} (${al.iata}) fares on Air1 Tickets.`,
    `Fare types from ${al.fareBrands[0]?.brand ?? "basic"} to ${al.fareBrands.filter((f) => f.cabin === "economy").slice(-1)[0]?.brand ?? "flexible"}, checked bags ${al.checkedBagFee > 0 ? `from ${formatMoney(al.checkedBagFee)}` : "included"}, hubs in ${joinNames(al.hubs.slice(0, 3).map((h) => getAirport(h)?.city ?? h))}.`,
    "Popular routes and booking tips.",
  ]);
  return buildMetadata({ title, description, path: airlinePath(al.slug), keywords: [`${al.name} flights`, `${al.name} fares`, `${al.name} baggage fees`, `${al.iata} airline`] });
}

export default async function AirlinePage({ params }: PageProps) {
  const { slug } = await params;
  const al = getAirlineBySlug(slug);
  if (!al) notFound();
  const path = airlinePath(al.slug);
  const hubs = al.hubs.map((h) => getAirport(h)).filter((a): a is NonNullable<typeof a> => Boolean(a));

  const routes: RouteLinkItem[] = [];
  const seen = new Set<string>();
  for (const r of ALL_DIRECTIONAL_ROUTES) {
    const o = getAirport(r.origin);
    const d = getAirport(r.destination);
    if (!o || !d) continue;
    const key = [o.iata, d.iata].sort().join("-");
    if (seen.has(key)) continue;
    if (!nonstopCarriers(o, d).some((c) => c.iata === al.iata)) continue;
    seen.add(key);
    routes.push({ origin: o, destination: d });
    if (routes.length >= 12) break;
  }

  const economy = al.fareBrands.filter((f) => f.cabin === "economy");
  const premium = al.fareBrands.filter((f) => f.cabin !== "economy");
  const facts: FactItem[] = [
    { label: "IATA / ICAO", value: `${al.iata}${al.icao ? ` / ${al.icao}` : ""}`, icon: Plane },
    { label: "Headquarters", value: al.headquarters ?? al.country, icon: Building2 },
    ...(al.founded ? [{ label: "Founded", value: String(al.founded), icon: CalendarDays }] : []),
    { label: "Alliance", value: al.alliance ? ALLIANCE_LABELS[al.alliance] : "None", icon: Handshake },
    ...(al.loyaltyProgram ? [{ label: "Loyalty program", value: al.loyaltyProgram, icon: Star }] : []),
    { label: "First checked bag", value: al.checkedBagFee > 0 ? `From ${formatMoney(al.checkedBagFee)} (domestic)` : "Included on most fares", icon: Luggage },
    { label: "Fare types", value: `${al.fareBrands.length} (${economy.length} economy)`, icon: Ticket },
    { label: "Website", value: al.website ? <a href={al.website} target="_blank" rel="noopener noreferrer" className="text-ocean-700 hover:underline">{al.website.replace(/^https?:\/\/(www\.)?/, "")}</a> : al.country, icon: Globe2 },
  ];

  const cheapest = economy[0];
  const standard = economy.find((f) => f.changeable && f.seatSelection === "free") ?? economy[1];
  const faqs: FAQ[] = [
    {
      question: `Does ${al.name} charge for checked bags?`,
      answer:
        al.checkedBagFee > 0
          ? `On most economy fares the first checked bag costs about ${formatMoney(al.checkedBagFee)} each way (more at the airport). ${al.fareBrands.some((f) => f.checkedBagsIncluded > 0) ? `${joinNames(al.fareBrands.filter((f) => f.checkedBagsIncluded > 0).slice(0, 3).map((f) => f.brand))} fares include at least one bag.` : "Elite members and co-branded credit-card holders usually get the first bag free."} We show the bag allowance for every fare before you book.`
          : `${al.name} includes at least one checked bag on ${al.fareBrands.every((f) => f.checkedBagsIncluded > 0) ? "all" : "most"} fares. Our results show the exact allowance for the fare you choose.`,
    },
    {
      question: `Can I bring a carry-on on ${al.name}'s cheapest fare?`,
      answer: cheapest
        ? cheapest.carryOnIncluded
          ? `Yes. ${al.name}'s ${cheapest.brand} fare includes a personal item and a full-size carry-on bag, but ${cheapest.seatSelection === "paid" ? "seat selection costs extra" : cheapest.seatSelection === "unavailable" ? "seats are assigned at check-in" : "seats are included"}${cheapest.changeable ? "" : " and the fare cannot be changed"}.`
          : `No. ${al.name}'s ${cheapest.brand} fare includes only a personal item that fits under the seat; a carry-on bag costs extra${standard ? `, or is included with the ${standard.brand} fare` : ""}. Compare the total before choosing the lowest fare.`
        : `${al.name} fares vary; our results show carry-on and checked-bag rules for each one.`,
    },
    {
      question: `Can I change or cancel a ${al.name} ticket?`,
      answer: `Every booking on Air1 Tickets can be cancelled free within 24 hours (for flights 7+ days out). After that, ${cheapest && !cheapest.changeable ? `${cheapest.brand} fares cannot be changed, while ` : ""}${standard ? `${standard.brand} fares allow changes ${standard.changeFee ? `for a ${formatMoney(standard.changeFee)} fee` : "with no change fee"} (you pay any fare difference)` : "change rules depend on the fare"}. Refundable fares return the full amount.`,
    },
    {
      question: `How do I check in for a ${al.name} flight?`,
      answer: `Check in online or in the ${al.name} app from 24 hours before departure using the airline confirmation code on your Air1 Tickets e-ticket. Your Air1 reference is for managing the booking with us; the airline code (six characters) is what ${al.name} needs.`,
    },
  ];

  return (
    <>
      <JsonLd data={[airlineJsonLd({ name: al.name, iata: al.iata, website: al.website, path }), faqPageJsonLd(faqs)]} />
      <PageHeader
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Airlines", path: "/airlines" },
          { name: al.name, path },
        ]}
        eyebrow={
          <span className="inline-flex items-center gap-2">
            {al.alliance && <Badge tone="outline">{ALLIANCE_LABELS[al.alliance]}</Badge>}
            {al.lowCost && <Badge tone="neutral">Low-cost carrier</Badge>}
            <span>{al.country}</span>
          </span>
        }
        title={
          <span className="inline-flex items-center gap-4">
            <AirlineLogo iata={al.iata} size={56} />
            {al.name} flights
          </span>
        }
        lead={al.description}
      />

      <section className="container-page py-12">
        <SectionHeading title={`${al.name} at a glance`} />
        <FactList className="mt-5" items={facts} columns={4} />
        {hubs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Hubs and focus cities</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {hubs.map((h) => (
                <li key={h.iata}>
                  <Link href={airportPath(h)} className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-navy-900 transition hover:border-ocean-400 hover:bg-ocean-50">
                    <span className="font-bold">{h.iata}</span> {h.city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="bg-white py-12">
        <div className="container-page">
          <SectionHeading title={`Fare types on ${al.name}`} description="What each fare includes, from cheapest to most flexible. We show these details on every result so you can compare the true total." />
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[44rem] text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Fare</th>
                  <th className="px-4 py-3">Cabin</th>
                  <th className="px-4 py-3">Carry-on</th>
                  <th className="px-4 py-3">Checked bags</th>
                  <th className="px-4 py-3">Seat selection</th>
                  <th className="px-4 py-3">Changes</th>
                  <th className="px-4 py-3">Refundable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...economy, ...premium].map((f) => (
                  <tr key={`${f.cabin}-${f.brand}`} className="bg-white">
                    <td className="px-4 py-3 font-semibold text-navy-900">{f.brand}</td>
                    <td className="px-4 py-3 text-slate-600">{CABIN_LABELS[f.cabin]}</td>
                    <td className="px-4 py-3 text-slate-600">{f.carryOnIncluded ? "Included" : "Personal item only"}</td>
                    <td className="px-4 py-3 text-slate-600">{f.checkedBagsIncluded > 0 ? `${f.checkedBagsIncluded} included` : f.checkedBagFee ? `From ${formatMoney(f.checkedBagFee)}` : "Extra"}</td>
                    <td className="px-4 py-3 text-slate-600">{f.seatSelection === "free" ? "Included" : f.seatSelection === "paid" ? "Fee" : "At check-in"}</td>
                    <td className="px-4 py-3 text-slate-600">{f.changeable ? (f.changeFee ? `${formatMoney(f.changeFee)} fee` : "Free") : "Not allowed"}</td>
                    <td className="px-4 py-3 text-slate-600">{f.refundable ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {routes.length > 0 && (
        <section className="container-page py-12">
          <SectionHeading title={`Popular ${al.name} routes`} description={`City pairs where ${al.name} flies nonstop. Each page shows fares by month, competing airlines and the best day to fly.`} />
          <RouteLinks className="mt-6" routes={routes} columns={3} ariaLabel={`${al.name} routes`} />
        </section>
      )}

      <section className="bg-white py-12">
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl sm:text-3xl">{al.name}: common questions</h2>
          <div className="mt-6">
            <FaqAccordion items={faqs} idPrefix="airline-faq" />
          </div>
          <p className="mt-6 text-xs text-slate-500">Fare rules and fees are set by {al.name} and change; the details shown when you search are authoritative for your booking. {al.name} is a trademark of its owner.</p>
        </div>
      </section>
    </>
  );
}
