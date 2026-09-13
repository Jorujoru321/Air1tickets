import {
  BadgeCheck,
  Clock3,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import { SearchTabs } from "@/components/search";
import { HeroMedia } from "@/components/marketing/HeroMedia";
import { PartnerStrip } from "@/components/marketing/PartnerStrip";
import { CaseStudies } from "@/components/marketing/CaseStudies";
import { TeamShot, hasTeamPhotos } from "@/components/marketing/TeamPhotos";
import { ChatButtons } from "@/components/leads/ChatButtons";
import { ClaimOffer } from "@/components/promo/ClaimOffer";
import { OfferCallout } from "@/components/promo/OfferCallout";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { destinationSuggestions } from "@/data/destinations";
import { PARTNERS } from "@/data/partners";
import { promo } from "@/lib/promo/offer";
import { site } from "@/lib/site";

export const revalidate = 86400;

/**
 * The page paid ads land on.
 *
 * Deliberately not indexed. An offer that says "you came from our ad" has to
 * be true for whoever is reading it, and letting Google serve this page to
 * organic traffic would make it a lie the moment it ranked. It also keeps a
 * thin, conversion-only page out of the index, which protects the 2,000+ real
 * pages that do the SEO work.
 */
export const metadata = buildMetadata({
  title: "Your Ad Rate — Air1 Tickets",
  description: `Send us your trip and a US-based agent quotes it at the ad rate — up to ${promo.discount}% off public fares across the US, Canada and beyond. Reply in about ${site.priceLock.responseMinutes} minutes on WhatsApp.`,
  path: "/offer",
  noIndex: true,
});

const STEPS = [
  {
    icon: Ticket,
    title: "Fill in the trip",
    text: "Where from, where to, and roughly when. Thirty seconds, no account, no card.",
  },
  {
    icon: MessageCircle,
    title: "It lands in WhatsApp",
    text: "Your trip and your offer code arrive already typed out. You just hit send.",
  },
  {
    icon: Clock3,
    title: "A price comes back",
    text: `About ${site.priceLock.responseMinutes} minutes, from a person, with the cheaper options you would not have found.`,
  },
];

const PROOF = [
  {
    icon: ShieldCheck,
    title: "Nothing to pay to ask",
    text: "A quote costs nothing and commits you to nothing. You pay only if you take the deal.",
  },
  {
    icon: BadgeCheck,
    title: "We say when online is cheaper",
    text: "If the public fare really is the best price, we tell you and you book it yourself. We would rather keep you than win one booking.",
  },
  {
    icon: PhoneCall,
    title: "A person, not a queue",
    text: `The agent who quotes your trip is the one who rebooks you if it changes. Or call ${site.supportPhone}.`,
  },
];

const FAQS = [
  {
    question: `What does "up to ${promo.discount}% off" actually mean?`,
    answer: `It is the difference between what an agent can put together and what the same trip is showing for publicly at that moment. Agencies hold consolidator, negotiated and last-minute inventory that public search never displays, and on some trips that gap is large. On others it is small, and on a few the public fare wins — in which case we say so. We quote your actual trip, show you what it costs, and you decide.`,
  },
  {
    question: "Is there a catch? Why is it cheaper?",
    answer:
      "No catch, and the reason is boring: we are paid a commission by airlines and hotels, and we can see fare classes and unsold inventory that consumer search sites are not permitted to show. That is what a travel agency is. The ticket is issued with the airline, in your name, and appears in their system like any other.",
  },
  {
    question: "How long does my rate hold?",
    answer: `The code is good for ${promo.hours} hours from when you arrived, and the timer on the page is the real one — it does not reset if you refresh. Once you have a quote you like, we can hold that specific price for ${site.priceLock.hours} hours free while you decide.`,
  },
  {
    question: "Do I have to use WhatsApp?",
    answer: `No. WhatsApp is fastest because your trip arrives already written out, but you can call ${site.supportPhone} or message us on Messenger instead. Mention your code either way.`,
  },
  {
    question: "When do I pay, and how?",
    answer:
      "Only after you have seen the price and said yes. We send a payment link that goes through a PCI-compliant processor. The site itself never takes a card, and we never ask for card details over chat.",
  },
  {
    question: "What if I need to change or cancel?",
    answer:
      "You message the same agent. US bookings made at least seven days ahead can be cancelled free within 24 hours under DOT rules, and we tell you the fare's own rules in plain English before you commit to anything.",
  },
];

export default function OfferPage() {
  return (
    <>
      <ClaimOffer source="meta" />
      <JsonLd
        data={[
          webPageJsonLd({
            name: "Your ad rate",
            description: metadata.description ?? "",
            path: "/offer",
          }),
          faqPageJsonLd(FAQS),
        ]}
      />

      <section className="relative isolate overflow-hidden bg-navy-950 text-white">
        <HeroMedia
          slot="home"
          theme="city"
          gradient={["#071229", "#1a75d8"]}
          seed="offer-hero"
        />
        <div className="container-page relative pb-10 pt-12 sm:pt-16">
          <p className="inline-flex items-center gap-2 rounded-full bg-sunrise-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sunrise-200 ring-1 ring-sunrise-300/30 backdrop-blur">
            <Ticket className="h-3.5 w-3.5" aria-hidden /> Your rate is active
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            Don&apos;t book that fare yet. Let us price it first.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80 sm:text-xl">
            Flights, hotels and tours across the US and Canada. Tell us the trip
            and a US-based agent prices it against what you&apos;re seeing
            online, using last-minute and consolidator inventory public search
            can&apos;t show. Free to ask, about{" "}
            {site.priceLock.responseMinutes} minutes for a reply.
          </p>
          <OfferCallout className="mt-6 max-w-3xl" />
          <div className="mt-8">
            <SearchTabs suggestions={destinationSuggestions()} />
          </div>
          <p className="mt-4 text-sm text-white/60">
            Your code goes into the message automatically. No account, no card,
            nothing to pay to get a price.
          </p>
        </div>
      </section>

      <PartnerStrip
        partners={PARTNERS.slice(0, 10)}
        title="We price against"
        subtitle="Brand names are shown for reference only. Air1 Tickets is an independent travel agency and is not affiliated with these companies."
      />

      <section className="container-page py-12">
        <SectionHeading
          title="What happens after you hit search"
          description="Three steps. The longest one is waiting for the reply."
        />
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sunrise-50 text-sunrise-700">
                <s.icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Step {i + 1}
              </p>
              <p className="mt-1 text-lg font-bold text-navy-900">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {s.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-white py-12">
        <div className="container-page grid items-center gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-2xl sm:text-3xl">
              Why you can send us your trip
            </h2>
            <ul className="mt-6 space-y-5">
              {PROOF.map((p) => (
                <li key={p.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
                    <p.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-lg font-bold text-navy-900">
                      {p.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-600">
                      {p.text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {hasTeamPhotos() ? (
            <TeamShot slot="office" className="shadow-card" />
          ) : null}
        </div>
      </section>

      <CaseStudies
        kind="flight"
        title="What this looks like in practice"
        description="The situations an agent handles that a search box cannot. Any price shown is what a real traveler actually paid."
      />

      <section className="bg-white py-12">
        <div className="container-page max-w-3xl">
          <SectionHeading id="faq" title="Before you ask" />
          <FaqAccordion className="mt-6" items={FAQS} idPrefix="offer-faq" />
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-navy-950 px-6 py-10 text-center text-white sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-2xl text-white">Not sure of your dates yet?</h2>
            <p className="mt-1 text-white/75">
              Message us anyway. Tell us roughly when and we&apos;ll tell you
              which dates cost less.
            </p>
          </div>
          <ChatButtons
            size="lg"
            onDark
            whatsappLabel="Message an agent"
            text={`Hi ${site.name}! I came from your ad and I'd like a quote. My trip: `}
          />
        </div>
      </section>
    </>
  );
}
