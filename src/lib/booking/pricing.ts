import type { ExtrasInput, ExtrasPricing, Offer } from "@/lib/flights/types";
import { getAirline } from "@/data/airlines";
import { getAirport } from "@/data/airports";
import { extrasPricing, tripKind } from "@/lib/flights/mock/pricing";

/**
 * Optional Air1 service fee per paying passenger (USD). Default 0 = no booking fees.
 * Read from NEXT_PUBLIC_SERVICE_FEE_PER_PASSENGER so the client summary and the
 * server-side charge always agree.
 */
export function serviceFeePerPassenger(): number {
  const n = Number(process.env.NEXT_PUBLIC_SERVICE_FEE_PER_PASSENGER ?? 0);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
}

export function extrasPricingFor(offer: Offer): ExtrasPricing {
  const o = getAirport(offer.slices[0].origin);
  const d = getAirport(offer.slices[0].destination);
  const airline = getAirline(offer.owner);
  const kind = o && d ? tripKind(o, d) : "domestic";
  if (airline) return extrasPricing(kind, airline);
  return { checkedBagFee: kind === "domestic" ? 35 : 60, travelInsurance: 24, flexibleTicket: 29, priorityBoarding: 15, seatFeeFrom: 9 };
}

export interface PriceSummary {
  fareBase: number;
  taxes: number;
  fareTotal: number;
  extras: { label: string; amount: number }[];
  extrasTotal: number;
  serviceFee: number;
  total: number;
  payingPassengers: number;
}

export function defaultExtras(): ExtrasInput {
  return { checkedBags: 0, seats: {}, travelInsurance: false, flexibleTicket: false, priorityBoarding: false };
}

/** Compute the full checkout total for an offer + selected extras. Pure and shared by client and server. */
export function summarizePrice(offer: Offer, extras: ExtrasInput): PriceSummary {
  const pricing = extrasPricingFor(offer);
  const paying = offer.passengers.adults + offer.passengers.children;
  const directions = offer.slices.length;
  const lines: { label: string; amount: number }[] = [];
  if (extras.checkedBags > 0) {
    const bags = extras.checkedBags * paying * directions;
    lines.push({ label: `${bags} checked bag${bags === 1 ? "" : "s"}`, amount: bags * pricing.checkedBagFee });
  }
  // Keys starting with "preference" are free seat preferences, not paid assignments.
  const seatCount = Object.keys(extras.seats ?? {}).filter((k) => !k.startsWith("preference")).length;
  if (seatCount > 0) lines.push({ label: `${seatCount} seat selection${seatCount === 1 ? "" : "s"}`, amount: seatCount * pricing.seatFeeFrom });
  if (extras.travelInsurance) lines.push({ label: "Travel protection", amount: pricing.travelInsurance * paying });
  if (extras.flexibleTicket) lines.push({ label: "Flexible ticket", amount: pricing.flexibleTicket * paying });
  if (extras.priorityBoarding) lines.push({ label: "Priority boarding", amount: pricing.priorityBoarding * paying * directions });
  const extrasTotal = round2(lines.reduce((n, l) => n + l.amount, 0));
  const serviceFee = round2(serviceFeePerPassenger() * paying);
  return {
    fareBase: round2(offer.price.base),
    taxes: round2(offer.price.taxes),
    fareTotal: round2(offer.price.total),
    extras: lines,
    extrasTotal,
    serviceFee,
    total: round2(offer.price.total + extrasTotal + serviceFee),
    payingPassengers: paying,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
