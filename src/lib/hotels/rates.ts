import type { Destination } from "@/data/types";

/**
 * Indicative nightly rates for a destination, shown as "typical" guidance only
 * — never as a live quote. The model is deliberately simple and transparent:
 * a regional base for a mid-range (3–4 star) double room in shoulder season,
 * nudged by how expensive the destination's air fares are (a decent proxy for
 * how expensive the city is) and whether it is a headline city.
 *
 * Real prices come from an agent shopping Expedia, Booking.com and direct
 * rates, which is what every price on the hotels page tells the visitor.
 */
const REGION_BASE: Record<string, number> = {
  "us-northeast": 210,
  "us-southeast": 165,
  "us-midwest": 150,
  "us-southwest": 155,
  "us-west": 195,
  "us-hawaii-alaska": 270,
  canada: 175,
  "mexico-caribbean": 185,
  "central-south-america": 130,
  europe: 190,
  "middle-east-africa": 175,
  asia: 120,
  oceania: 200,
};

export interface NightlyRate {
  /** Typical mid-range (3–4 star) nightly rate, USD. */
  midRange: number;
  /** Typical entry-level nightly rate, USD. */
  budget: number;
  /** Typical 5-star / resort nightly rate, USD. */
  luxury: number;
}

export function typicalNightly(d: Destination): NightlyRate {
  const base = REGION_BASE[d.region] ?? 170;
  const fares = d.typicalFares.map((f) => f.price);
  const avgFare = fares.length ? fares.reduce((a, b) => a + b, 0) / fares.length : 300;
  // Fare level nudges the rate by at most ±25%.
  const fareFactor = Math.min(1.25, Math.max(0.75, 0.72 + avgFare / 1400));
  const popularity = d.popular ? 1.08 : 1;
  const mid = Math.round((base * fareFactor * popularity) / 5) * 5;
  return { midRange: mid, budget: Math.round((mid * 0.58) / 5) * 5, luxury: Math.round((mid * 2.35) / 10) * 10 };
}
