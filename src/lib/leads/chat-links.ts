import type { Offer } from "@/lib/flights/types";
import { getAirport } from "@/data/airports";
import { getAirline } from "@/data/airlines";
import { site } from "@/lib/site";
import { formatDateShort, formatMoney } from "@/lib/utils";

/** wa.me deep link with a prefilled message. Works on mobile and WhatsApp Web. */
export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${site.chat.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** m.me deep link to the Facebook Page; Messenger does not support prefilled text, so we pass a ref. */
export function messengerLink(ref?: string): string {
  const base = `https://m.me/${site.chat.messenger}`;
  return ref ? `${base}?ref=${encodeURIComponent(ref)}` : base;
}

export function telegramLink(): string | null {
  return site.chat.telegram ? `https://t.me/${site.chat.telegram}` : null;
}

export function smsLink(text?: string): string {
  const base = `sms:+${site.chat.whatsapp}`;
  return text ? `${base}?&body=${encodeURIComponent(text)}` : base;
}

/** One-line human summary of an offer for chat messages and lead emails. */
export function describeOffer(offer: Offer): string {
  const out = offer.slices[0];
  const back = offer.slices[1];
  const o = getAirport(out.origin);
  const d = getAirport(out.destination);
  const airline = getAirline(offer.owner)?.name ?? offer.owner;
  const pax = offer.passengers.adults + offer.passengers.children + offer.passengers.infants;
  const dates = back ? `${formatDateShort(out.departure)} – ${formatDateShort(back.departure)}` : formatDateShort(out.departure);
  const stops = offer.slices.map((s) => (s.stops === 0 ? "nonstop" : `${s.stops} stop`)).join(" / ");
  return `${o?.city ?? out.origin} (${out.origin}) → ${d?.city ?? out.destination} (${out.destination}), ${dates}, ${airline}, ${stops}, ${offer.cabin.replace("_", " ")}, ${pax} traveler${pax > 1 ? "s" : ""}, ${formatMoney(offer.price.total / Math.max(1, offer.passengers.adults + offer.passengers.children))} per traveler`;
}

/** Prefilled WhatsApp text for a specific fare the traveler is looking at. */
export function offerChatText(offer: Offer, reference?: string): string {
  const intro = reference ? `Hi Air1, I locked fare ${reference}:` : "Hi Air1, I'd like to lock this fare:";
  return `${intro} ${describeOffer(offer)}. Can you send me your best last-minute deal?`;
}

export function genericChatText(): string {
  return `Hi ${site.name}, I'm looking for a cheap flight. Can you help me lock a low fare?`;
}
