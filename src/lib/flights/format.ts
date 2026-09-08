/** Presentation helpers for itineraries — shared by results, booking and emails. */
import type { Offer, Slice, Segment, CabinClass } from "./types";
import { CABIN_LABELS } from "./types";
import { getAirport } from "@/data/airports";
import { airlineName } from "@/data/airlines";
import { formatDuration, formatTime } from "@/lib/utils";

export function stopsLabel(stops: number): string {
  if (stops === 0) return "Nonstop";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
}

export function layoverLabel(slice: Slice): string {
  if (!slice.layovers.length) return "Nonstop";
  return slice.layovers.map((l) => `${formatDuration(l.durationMinutes)} in ${l.airport}`).join(", ");
}

export function airportCity(code: string): string {
  return getAirport(code)?.city ?? code;
}

export function airportName(code: string): string {
  const a = getAirport(code);
  return a ? `${a.name} (${a.iata})` : code;
}

export function cityWithCode(code: string): string {
  const a = getAirport(code);
  return a ? `${a.city} (${a.iata})` : code;
}

/** "DL 1234 · Delta Air Lines" or with operator note. */
export function segmentCarrierLabel(seg: Segment): string {
  const base = `${seg.flightNumber} · ${airlineName(seg.marketingCarrier)}`;
  if (seg.operatingCarrier !== seg.marketingCarrier) return `${base} (operated by ${airlineName(seg.operatingCarrier)})`;
  return base;
}

/** Distinct marketing carriers across the whole offer, in order of appearance. */
export function offerCarriers(offer: Offer): string[] {
  const seen: string[] = [];
  for (const s of offer.slices) for (const seg of s.segments) if (!seen.includes(seg.marketingCarrier)) seen.push(seg.marketingCarrier);
  return seen;
}

export function offerCarrierLabel(offer: Offer): string {
  const carriers = offerCarriers(offer);
  if (carriers.length === 1) return airlineName(carriers[0]);
  if (carriers.length === 2) return `${airlineName(carriers[0])} + ${airlineName(carriers[1])}`;
  return "Multiple airlines";
}

export function totalDuration(offer: Offer): number {
  return offer.slices.reduce((n, s) => n + s.durationMinutes, 0);
}

export function totalStops(offer: Offer): number {
  return offer.slices.reduce((n, s) => n + s.stops, 0);
}

export function timeRange(slice: Slice): string {
  const plus = slice.daysOffset > 0 ? ` +${slice.daysOffset}` : "";
  return `${formatTime(slice.departure)} – ${formatTime(slice.arrival)}${plus}`;
}

export function cabinLabel(cabin: CabinClass): string {
  return CABIN_LABELS[cabin];
}

export function isRedEye(slice: Slice): boolean {
  const h = Number(slice.departure.slice(11, 13));
  return h >= 21 || h < 5;
}

export function departureBucket(isoLocal: string): "early" | "morning" | "afternoon" | "evening" {
  const h = Number(isoLocal.slice(11, 13));
  if (h < 6) return "early";
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

export const DEPARTURE_BUCKETS: { id: "early" | "morning" | "afternoon" | "evening"; label: string; range: string }[] = [
  { id: "early", label: "Early", range: "12am – 6am" },
  { id: "morning", label: "Morning", range: "6am – 12pm" },
  { id: "afternoon", label: "Afternoon", range: "12pm – 6pm" },
  { id: "evening", label: "Evening", range: "6pm – 12am" },
];

export function fareSummaryChips(offer: Offer): { label: string; included: boolean }[] {
  const f = offer.fare;
  return [
    { label: "Personal item", included: true },
    { label: "Carry-on bag", included: f.carryOnIncluded },
    { label: f.checkedBagsIncluded > 0 ? `${f.checkedBagsIncluded} checked bag${f.checkedBagsIncluded > 1 ? "s" : ""}` : "Checked bag", included: f.checkedBagsIncluded > 0 },
    { label: f.seatSelection === "free" ? "Free seat selection" : f.seatSelection === "paid" ? "Seat selection (fee)" : "Seats assigned at check-in", included: f.seatSelection === "free" },
    { label: f.changeable ? (f.changeFee ? `Changes ($${f.changeFee} fee)` : "Free changes") : "No changes", included: f.changeable },
    { label: f.refundable ? "Refundable" : "Non-refundable", included: f.refundable },
  ];
}
