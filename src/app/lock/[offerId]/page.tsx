import type { Metadata } from "next";
import { Clock, Lock, MessageCircle, ShieldCheck, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AirlineLogo } from "@/components/results/AirlineLogo";
import { FareChips, SliceTimeline } from "@/components/results/ItineraryDetails";
import { LockFareForm } from "@/components/leads/LockFareForm";
import { getFlightProvider } from "@/lib/flights/provider";
import { decodeOfferId } from "@/lib/flights/mock/engine";
import { buildSearchUrl } from "@/lib/flights/search-params";
import { getCurrentUser } from "@/lib/auth/current-user";
import { lockedPriceFor } from "@/lib/leads/reference";
import { offerChatText, whatsappLink } from "@/lib/leads/chat-links";
import { getAirline } from "@/data/airlines";
import { getAirport } from "@/data/airports";
import { site } from "@/lib/site";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lock this fare",
  robots: { index: false, follow: false },
};

function searchUrlFor(offerId: string): string {
  const decoded = decodeOfferId(offerId);
  return decoded ? buildSearchUrl(decoded.params) : "/flights";
}

const STEPS = [
  { icon: Lock, title: "We hold this price", text: `Your locked fare is the most you'll pay, held for ${site.priceLock.hours} hours. No card needed.` },
  { icon: MessageCircle, title: "An agent confirms on WhatsApp", text: `Within about ${site.priceLock.responseMinutes} minutes during business hours, with your reference and the itinerary.` },
  { icon: Tag, title: "Your last-minute deal", text: "1–2 days before departure we re-check every airline and send your final price — usually lower." },
  { icon: ShieldCheck, title: "Pay only when you accept", text: "Ticket issued with the airline, confirmation and airline code emailed to you." },
];

export default async function LockPage({ params, searchParams }: { params: Promise<{ offerId: string }>; searchParams: Promise<{ src?: string }> }) {
  const [{ offerId: raw }, { src }] = await Promise.all([params, searchParams]);
  const offerId = decodeURIComponent(raw);
  const offer = await getFlightProvider().getOffer(offerId);
  const searchUrl = searchUrlFor(offerId);

  if (!offer) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <h1 className="text-2xl">This fare is no longer available</h1>
          <p className="mt-3 text-slate-600">The airline has withdrawn this price or the seats have sold out. Search again to lock a current fare — similar options are usually available.</p>
          <Button href={searchUrl} className="mt-6" size="lg">
            See current fares
          </Button>
        </div>
      </div>
    );
  }

  const user = await getCurrentUser();
  const price = lockedPriceFor(offer);
  const airline = getAirline(offer.owner);
  const o = getAirport(offer.slices[0].origin);
  const d = getAirport(offer.slices[0].destination);
  const travelers = offer.passengers.adults + offer.passengers.children + offer.passengers.infants;
  const chatText = offerChatText(offer);

  return (
    <div className="bg-slate-50">
      <div className="container-page py-8 sm:py-10">
        <div className="mb-6 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-ocean-700">Step 2 of 2 · Free, no card</p>
          <h1 className="mt-1 text-2xl sm:text-3xl">
            Lock {formatMoney(price)} to {d?.city ?? offer.slices[0].destination}
          </h1>
          <p className="mt-2 text-slate-600">Tell us how to reach you and we&apos;ll hold this price for {site.priceLock.hours} hours. An agent then finds you a last-minute deal before you fly.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start">
          <section aria-labelledby="lock-form-heading" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <h2 id="lock-form-heading" className="text-lg font-bold text-navy-900">
              Your details
            </h2>
            <div className="mt-5">
              <LockFareForm offerId={offer.id} price={price} lockHours={site.priceLock.hours} source={src ?? "results"} initial={user ? { name: `${user.firstName} ${user.lastName}`.trim(), email: user.email, phone: user.phone ?? "" } : undefined} whatsappHref={whatsappLink(chatText)} />
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-[calc(var(--header-height)+1rem)]">
            <section aria-labelledby="trip-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <h2 id="trip-heading" className="text-base font-bold text-navy-900">
                  Fare you&apos;re locking
                </h2>
                <Badge tone="ocean">{offer.slices.length > 1 ? "Round trip" : "One way"}</Badge>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <AirlineLogo iata={offer.owner} size={36} />
                <div>
                  <p className="font-semibold text-navy-900">{airline?.name ?? offer.owner}</p>
                  <p className="text-xs text-slate-500">
                    {o?.city ?? offer.slices[0].origin} → {d?.city ?? offer.slices[0].destination} · {travelers} traveler{travelers > 1 ? "s" : ""} · {offer.cabin.replace("_", " ")}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-4">
                {offer.slices.map((s, i) => (
                  <SliceTimeline key={i} slice={s} title={i === 0 ? "Outbound" : "Return"} />
                ))}
              </div>
              <FareChips offer={offer} className="mt-4" />
              <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">Per traveler</dt>
                  <dd className="font-semibold tabular-nums text-navy-900">{formatMoney(price)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Total for {travelers}</dt>
                  <dd className="tabular-nums text-slate-700">{formatMoney(offer.price.total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Taxes &amp; fees</dt>
                  <dd className="tabular-nums text-slate-700">included</dd>
                </div>
              </dl>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" aria-hidden /> Locked for {site.priceLock.hours} hours from now
              </p>
            </section>

            <section aria-label="What happens next" className="rounded-2xl bg-navy-900 p-5 text-white">
              <ol className="space-y-4">
                {STEPS.map((s, i) => (
                  <li key={s.title} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-ocean-200">
                      <s.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">
                        {i + 1}. {s.title}
                      </span>
                      <span className="block text-xs text-white/70">{s.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
