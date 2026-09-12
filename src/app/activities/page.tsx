import Link from "next/link";
import { Binoculars, Compass, Landmark, MessageCircle, Ship, Ticket, UtensilsCrossed, Waves } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ActivitySearchForm } from "@/components/search";
import { DestinationArt } from "@/components/marketing/DestinationArt";
import { PartnerStrip } from "@/components/marketing/PartnerStrip";
import { ChatButtons } from "@/components/leads/ChatButtons";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { destinationPath } from "@/lib/seo/slugs";
import { POPULAR_DESTINATIONS, destinationSuggestions } from "@/data/destinations";
import { partnersFor } from "@/data/partners";
import { site } from "@/lib/site";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Things to Do — Tours, Tickets & Day Trips by WhatsApp",
  description: "Skip the research. Tell us the city and date and a US-based agent sends a short list of tours, attraction tickets, day trips and transfers with real prices on WhatsApp.",
  path: "/activities",
  keywords: ["things to do", "tours and tickets", "day trips", "excursions", "attraction tickets", "travel activities"],
});

const CATEGORIES = [
  { icon: Compass, title: "Tours & sightseeing", text: "Half-day city tours, hop-on hop-off passes, walking tours with a guide who actually knows the place." },
  { icon: Ticket, title: "Theme parks & attractions", text: "Multi-day park tickets, observation decks, aquariums and skip-the-line entry to the big museums." },
  { icon: Ship, title: "Day trips & excursions", text: "Ruins, islands, wine country, volcanoes. Transport, guide and lunch usually included." },
  { icon: Waves, title: "Water sports & beaches", text: "Snorkeling, catamaran days, jet skis, beach clubs and sunset sails." },
  { icon: UtensilsCrossed, title: "Food & nightlife", text: "Food tours, cooking classes, dinner shows and tables that are hard to get without a local call." },
  { icon: Landmark, title: "Museums & culture", text: "Timed entry, guided highlights and the quieter alternatives when the famous one is packed." },
];

const HOW = [
  { step: "Tell us where and when", text: "One form, ten seconds. It opens WhatsApp with your request already written." },
  { step: "Get a short list", text: "Three or four options with prices, duration, what's included and where you get picked up." },
  { step: "Book what you like", text: "We hold the spots, send the vouchers to your phone, and you show them at the door." },
];

const FAQS = [
  { question: "How do I book a tour or ticket with Air1?", answer: "Tell us the city, the date and roughly what you're in the mood for. That opens WhatsApp with your request written out. An agent comes back with a short list of options that are actually available on your date, with total prices and pick-up details. Say yes to one and we send the vouchers to your phone." },
  { question: "Why not just book on a tour site myself?", answer: "You can, and for a simple museum ticket it's often the fastest thing to do. Where an agent helps is when availability is tight, when you want the version of a tour that isn't oversold, or when you're fitting several things around a flight and a hotel. We also cancel and rebook for you when a flight moves." },
  { question: "Do you charge extra for activities?", answer: "No. We're paid a commission by the operator, so you pay the same as booking direct. If an operator ever charges a service fee, it's shown before you agree." },
  { question: "How far ahead should I book?", answer: "Popular day trips and anything with limited capacity sell out one to three weeks ahead in high season. Attraction tickets are usually fine a few days out. If you're already at your destination, message us anyway — last-minute spots open up constantly and that's exactly what we watch for." },
  { question: "Can you arrange airport transfers?", answer: "Yes. Send your flight number and hotel and we'll quote a private transfer or a shared shuttle. It is usually cheaper than an airport taxi and the driver waits if your flight is late." },
  { question: "What if the weather ruins my plan?", answer: "Most outdoor operators reschedule or refund for weather cancellations, and we tell you the policy before you book. If it happens while you're there, message us and we'll move it to another day or find an indoor alternative." },
];

export default function ActivitiesPage() {
  const suggestions = destinationSuggestions();
  const featured = POPULAR_DESTINATIONS.slice(0, 8);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Things to do", path: "/activities" },
  ];

  return (
    <>
      <JsonLd data={[webPageJsonLd({ name: "Things to do", description: metadata.description ?? "", path: "/activities" }), faqPageJsonLd(FAQS)]} />

      <section className="relative isolate overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 -z-10 opacity-45" aria-hidden>
          <DestinationArt theme="historic" gradient={["#071229", "#2f5296"]} seed="activities-hero" />
        </div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(255,107,53,0.28),transparent_55%)]" aria-hidden />
        <div className="container-page pb-10 pt-6 sm:pt-8">
          <Breadcrumbs items={crumbs} className="text-white/70 [&_a:hover]:text-white [&_span[aria-current]]:text-white" />
          <div className="mt-10 max-w-3xl sm:mt-14">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ocean-200 backdrop-blur">
              <Binoculars className="h-3.5 w-3.5" aria-hidden /> Tours, tickets &amp; day trips
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl">Things to do, picked by someone who&apos;s been</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">Tell us the city and the date. An agent sends a short list of tours, tickets and day trips that are actually available, with real prices — on WhatsApp, in about {site.priceLock.responseMinutes} minutes.</p>
          </div>
          <div className="mt-8">
            <ActivitySearchForm suggestions={suggestions} />
          </div>
        </div>
      </section>

      <PartnerStrip partners={partnersFor("activities", "marketplace")} title="Options sourced from" subtitle="Brand names are shown for reference only. Air1 Tickets is an independent travel agency and is not affiliated with these companies." />

      <section className="container-page py-12">
        <SectionHeading title="What we book" description="Anything with a ticket or a guide. If it isn't listed, ask anyway." />
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <li key={c.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sunrise-50 text-sunrise-700">
                <c.icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-4 text-lg font-bold text-navy-900">{c.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{c.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-navy-900 py-12 text-white">
        <div className="container-page">
          <h2 className="text-2xl text-white sm:text-3xl">How it works</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {HOW.map((h, i) => (
              <li key={h.step} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sunrise-500 font-display text-sm font-extrabold text-navy-950">{i + 1}</span>
                <p className="mt-4 text-lg font-bold">{h.step}</p>
                <p className="mt-1 text-sm text-white/75">{h.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-12">
        <SectionHeading title="Popular destinations" description="Guides with what's worth doing, when to go and what it costs." link={{ href: "/destinations", label: "All destinations" }} />
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((d) => (
            <li key={d.slug}>
              <Link href={destinationPath(d.slug)} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
                <div className="aspect-[16/10]">
                  <DestinationArt theme={d.heroTheme} gradient={d.gradient} seed={`act-${d.slug}`} />
                </div>
                <div className="p-4">
                  <p className="font-display text-lg font-bold text-navy-900 group-hover:text-ocean-700">{d.city}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{d.highlights[0]?.title ?? d.tagline}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white py-12">
        <div className="container-page max-w-3xl">
          <SectionHeading id="faq" title="Questions about tours and tickets" />
          <FaqAccordion className="mt-6" items={FAQS} idPrefix="activity-faq" />
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-sunrise-500 px-6 py-10 text-center text-navy-950 sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="flex items-center gap-2 text-2xl text-navy-950">
              <MessageCircle className="h-6 w-6" aria-hidden /> Already there and bored?
            </h2>
            <p className="mt-1 text-navy-900/85">Message us your city and today&apos;s date. We find something good, fast.</p>
          </div>
          <ChatButtons size="lg" showMessenger={false} whatsappLabel="Ask what's on" text={`Hi ${site.name}! I'm in `} />
        </div>
      </section>
    </>
  );
}
