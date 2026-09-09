import type { Offer } from "@/lib/flights/types";
import { departureBucket, totalDuration, totalStops } from "@/lib/flights/format";

export type SortKey = "best" | "cheapest" | "fastest";

export interface FilterState {
  stops: number[]; // allowed stop counts: 0, 1, 2 (2 = 2+)
  airlines: string[]; // empty = all
  outboundTimes: string[]; // bucket ids; empty = all
  returnTimes: string[];
  maxDuration: number | null; // minutes (total)
  maxPrice: number | null;
  carryOnOnly: boolean;
  checkedBagOnly: boolean;
  noOvernightLayovers: boolean;
}

export const EMPTY_FILTERS: FilterState = {
  stops: [],
  airlines: [],
  outboundTimes: [],
  returnTimes: [],
  maxDuration: null,
  maxPrice: null,
  carryOnOnly: false,
  checkedBagOnly: false,
  noOvernightLayovers: false,
};

export function maxStops(offer: Offer): number {
  return Math.min(2, Math.max(...offer.slices.map((s) => s.stops)));
}

export function matchesFilters(offer: Offer, f: FilterState): boolean {
  if (f.stops.length && !f.stops.includes(maxStops(offer))) return false;
  if (f.airlines.length && !f.airlines.includes(offer.owner)) return false;
  if (f.outboundTimes.length && !f.outboundTimes.includes(departureBucket(offer.slices[0].departure))) return false;
  if (f.returnTimes.length && offer.slices[1] && !f.returnTimes.includes(departureBucket(offer.slices[1].departure))) return false;
  if (f.maxDuration !== null && totalDuration(offer) > f.maxDuration) return false;
  if (f.maxPrice !== null && offer.price.total > f.maxPrice) return false;
  if (f.carryOnOnly && !offer.fare.carryOnIncluded) return false;
  if (f.checkedBagOnly && offer.fare.checkedBagsIncluded < 1) return false;
  if (f.noOvernightLayovers && offer.slices.some((s) => s.layovers.some((l) => l.overnight))) return false;
  return true;
}

export function activeFilterCount(f: FilterState): number {
  let n = 0;
  if (f.stops.length) n++;
  if (f.airlines.length) n++;
  if (f.outboundTimes.length) n++;
  if (f.returnTimes.length) n++;
  if (f.maxDuration !== null) n++;
  if (f.maxPrice !== null) n++;
  if (f.carryOnOnly) n++;
  if (f.checkedBagOnly) n++;
  if (f.noOvernightLayovers) n++;
  return n;
}

/** Same scoring the engine uses to tag "best". */
export function bestScore(offer: Offer, minPrice: number, minDuration: number): number {
  return (offer.price.total / minPrice) * 0.62 + (totalDuration(offer) / minDuration) * 0.3 + totalStops(offer) * 0.07;
}

export function sortOffers(offers: Offer[], sort: SortKey): Offer[] {
  if (!offers.length) return offers;
  const list = [...offers];
  if (sort === "cheapest") return list.sort((a, b) => a.price.total - b.price.total || totalDuration(a) - totalDuration(b));
  if (sort === "fastest") return list.sort((a, b) => totalDuration(a) - totalDuration(b) || a.price.total - b.price.total);
  const minPrice = Math.min(...list.map((o) => o.price.total));
  const minDuration = Math.min(...list.map(totalDuration));
  return list.sort((a, b) => bestScore(a, minPrice, minDuration) - bestScore(b, minPrice, minDuration));
}

export function summaryFor(offers: Offer[], sort: SortKey): { price: number; duration: number } | null {
  const sorted = sortOffers(offers, sort);
  if (!sorted.length) return null;
  return { price: sorted[0].price.total, duration: totalDuration(sorted[0]) };
}
