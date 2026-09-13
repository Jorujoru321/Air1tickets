import Link from "next/link";
import {
  BedDouble,
  CalendarCheck,
  MessageCircle,
  Percent,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HotelSearchForm } from "@/components/search";
import { DestinationArt } from "@/components/marketing/DestinationArt";
import { PartnerStrip } from "@/components/marketing/PartnerStrip";
import { ChatButtons } from "@/components/leads/ChatButtons";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqPageJsonLd, serviceJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { destinationPath } from "@/lib/seo/slugs";
import { typicalNightly } from "@/lib/hotels/rates";
import {
  DESTINATIONS,
  POPULAR_DESTINATIONS,
  destinationSuggestions,
} from "@/data/destinations";
import { partnersFor } from "@/data/partners";
import { destinationPhoto } from "@/data/photos";
import { HeroMedia } from "@/components/marketing/HeroMedia";
import { CaseStudies } from "@/components/marketing/CaseStudies";
import { OfferCallout } from "@/components/promo/OfferCallout";
import { site } from "@/lib/site";
import { formatMoney } from "@/lib/utils";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Hotels — Tell Us Where, Get a Price on WhatsApp",
  description:
    "Hotel deals without the endless tabs. Tell us the city and dates and a US-based agent compares Expedia, Booking.com and direct hotel rates, then sends you the lowest price on WhatsApp.",
  path: "/hotels",
  keywords: [
    "cheap hotels",
    "hotel deals",
    "book hotel whatsapp",
    "all inclusive resorts",
    "last minute hotel deals",
  ],
});

const WHY = [
  {
    icon: Percent,
    title: "Agent rates, not list prices",
    text: "We hold negotiated and consolidator rates that public sites can't show, and we pass the saving on.",
  },
  {
    icon: MessageCircle,
    title: "One message, several options",
    text: "You get three or four real choices with photos, total prices and what's included — not 900 results to sort.",
  },
  {
    icon: CalendarCheck,
    title: "Free to ask, free to change",
    text: "Getting a quote costs nothing and there is no account to create. Most rooms we quote are free to cancel.",
  },
  {
    icon: ShieldCheck,
    title: "Booked and backed by a person",
    text: `If the property messes up your reservation you message the same agent on WhatsApp, or call ${site.supportPhone}.`,
  },
];

const FAQS = [
  {
    question: "How does booking a hotel through Air1 work?",
    answer:
      "Tell us the city, your dates and how many rooms you need. That opens WhatsApp with your request already written out. An agent compares Expedia, Booking.com, the hotel's own rate and our negotiated rates, then sends you a short list with total prices. If you like one, we book it and send the confirmation. No account, no card until you say yes.",
  },
  {
    question: "Is it cheaper than booking myself?",
    answer:
      "Often, yes. Agencies hold consolidator and negotiated rates that public sites cannot display, and we also catch the discounts that only appear when a room is close to going unsold. When the public rate really is the best, we tell you and book that instead — we would rather keep the customer than win one booking.",
  },
  {
    question: "Can you book all-inclusive resorts?",
    answer:
      "Yes, and it is one of the things we do most. Tell us your budget per person and whether you want adults-only, beachfront or a family resort with a kids' club, and we send options that fit. All-inclusive pricing changes a lot by date, so we usually suggest two or three date pairs that cost noticeably less.",
  },
  {
    question: "When should I ask about a hotel?",
    answer:
      "Any time, but two windows matter: two to three months out for peak periods and popular resorts, and the last week before travel, when hotels discount unsold rooms. If your dates are flexible, tell us and we will quote both.",
  },
  {
    question: "Do you charge a booking fee?",
    answer:
      "No. We are paid a commission by the hotel, so the price you see is the price you pay. If a specific rate ever carries a fee, it is shown before you agree to anything.",
  },
  {
    question: "What if I need to cancel?",
    answer:
      "We tell you the cancellation terms before you book and we prefer flexible rates unless a non-refundable rate saves you a lot and you ask for it. To cancel, message the same agent on WhatsApp and we handle it with the property.",
  },
];

export default function HotelsPage() {
  const suggestions = destinationSuggestions();
  const featured = POPULAR_DESTINATIONS.slice(0, 8);
  // All-inclusive belongs to beach and resort destinations, not every city in the region.
  const resorts = DESTINATIONS.filter(
    (d) =>
      d.region === "mexico-caribbean" &&
      (d.heroTheme === "beach" || d.heroTheme === "tropical"),
  ).slice(0, 4);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/hotels" },
  ];

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: "Hotels",
            description: metadata.description ?? "",
            path: "/hotels",
          }),
          serviceJsonLd({
            name: "Hotel booking",
            description: metadata.description ?? "",
            path: "/hotels",
            serviceType: "Hotel reservation service",
          }),
          faqPageJsonLd(FAQS),
        ]}
      />

      <section className="relative isolate overflow-hidden bg-navy-950 text-white">
        <HeroMedia
          slot="hotels"
          theme="tropical"
          gradient={["#071229", "#1a75d8"]}
          seed="hotels-hero"
        />
        <div className="container-page pb-10 pt-6 sm:pt-8">
          <Breadcrumbs
            items={crumbs}
            className="text-white/70 [&_a:hover]:text-white [&_span[aria-current]]:text-white"
          />
          <div className="mt-10 max-w-3xl sm:mt-14">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ocean-200 backdrop-blur">
              <BedDouble className="h-3.5 w-3.5" aria-hidden /> Hotels &amp;
              resorts
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl">
              Stop comparing tabs. Ask one agent.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              Tell us the city and your dates. We compare Expedia, Booking.com,
              direct hotel rates and our own negotiated rates, then send you the
              best few options on WhatsApp.
            </p>
          </div>
          <OfferCallout className="mt-6 max-w-3xl" />
          <div className="mt-8">
            <HotelSearchForm suggestions={suggestions} />
          </div>
        </div>
      </section>

      <PartnerStrip
        partners={partnersFor("marketplace", "hotels")}
        title="Rates compared across"
        subtitle="Brand names are shown for reference only. Air1 Tickets is an independent travel agency and is not affiliated with these companies."
      />

      <section className="container-page py-12">
        <SectionHeading
          title="Popular places we book"
          description="Typical nightly rates for a mid-range double room, before the discounts an agent can find. Ask for your dates and we'll quote the real price."
          link={{ href: "/destinations", label: "All destinations" }}
        />
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((d) => {
            const rate = typicalNightly(d);
            return (
              <li key={d.slug}>
                <Link
                  href={destinationPath(d.slug)}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
                >
                  <div className="aspect-[16/10]">
                    <DestinationArt
                      theme={d.heroTheme}
                      gradient={d.gradient}
                      seed={`hotel-${d.slug}`}
                      image={destinationPhoto(d.slug) ?? undefined}
                      alt={`Hotels in ${d.city}`}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="font-display text-lg font-bold text-navy-900 group-hover:text-ocean-700">
                      {d.city}
                    </p>
                    <p className="text-xs text-slate-500">
                      {d.countryCode === "US" ? d.state : d.country}
                    </p>
                    <p className="mt-auto pt-3 text-sm text-slate-700">
                      Typically{" "}
                      <span className="font-bold text-navy-900">
                        {formatMoney(rate.midRange)}
                      </span>{" "}
                      <span className="text-slate-500">/ night</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Budget from {formatMoney(rate.budget)} · 5-star from{" "}
                      {formatMoney(rate.luxury)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-slate-500">
          Typical rates are editorial estimates for a mid-range double room in
          shoulder season, not live availability. Message us for a real quote on
          your dates.
        </p>
      </section>

      <section className="bg-white py-12">
        <div className="container-page">
          <SectionHeading title="Why travelers ask us instead of booking online" />
          <ul className="mt-6 grid gap-5 md:grid-cols-2">
            {WHY.map((w) => (
              <li
                key={w.title}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
                  <w.icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-lg font-bold text-navy-900">
                    {w.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-600">
                    {w.text}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-12">
        <SectionHeading
          title="All-inclusive resorts"
          description="Our most-asked-for trips. Tell us your budget per person and we'll match the resort to it."
        />
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {resorts.map((d) => (
            <li
              key={d.slug}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"
            >
              <div className="aspect-[16/10]">
                <DestinationArt
                  theme={d.heroTheme}
                  gradient={d.gradient}
                  seed={`resort-${d.slug}`}
                  image={destinationPhoto(d.slug) ?? undefined}
                  alt={`Resorts in ${d.city}`}
                />
              </div>
              <div className="p-4">
                <p className="font-display text-lg font-bold text-navy-900">
                  {d.city}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                  {d.tagline}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ocean-700">
                  All-inclusive from {formatMoney(typicalNightly(d).midRange)} /
                  night
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <CaseStudies
        kind="hotel"
        title="Where an agent beats a search box"
        description="What we do that a hotel search page cannot."
      />

      <section className="bg-white py-12">
        <div className="container-page max-w-3xl">
          <SectionHeading id="faq" title="Hotel questions, answered" />
          <FaqAccordion className="mt-6" items={FAQS} idPrefix="hotel-faq" />
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-navy-950 px-6 py-10 text-center text-white sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="flex items-center gap-2 text-2xl text-white">
              <Sparkles className="h-6 w-6 text-sunrise-400" aria-hidden /> Know
              where you want to stay?
            </h2>
            <p className="mt-1 text-white/75">
              Send us the city and dates. A price comes back in about{" "}
              {site.priceLock.responseMinutes} minutes.
            </p>
          </div>
          <ChatButtons
            size="lg"
            onDark
            whatsappLabel="Ask about a hotel"
            text={`Hi ${site.name}! I'd like a hotel quote. Where: `}
          />
        </div>
      </section>
    </>
  );
}
