/**
 * Shapes for the curated content datasets in `src/data` and `src/content`.
 * Airport / Airline live in `@/lib/flights/types`.
 */

export type Region =
  | "us-northeast"
  | "us-southeast"
  | "us-midwest"
  | "us-southwest"
  | "us-west"
  | "us-hawaii-alaska"
  | "canada"
  | "mexico-caribbean"
  | "central-south-america"
  | "europe"
  | "middle-east-africa"
  | "asia"
  | "oceania";

export const REGION_LABELS: Record<Region, string> = {
  "us-northeast": "US Northeast",
  "us-southeast": "US Southeast",
  "us-midwest": "US Midwest",
  "us-southwest": "US Southwest",
  "us-west": "US West",
  "us-hawaii-alaska": "Hawaii & Alaska",
  canada: "Canada",
  "mexico-caribbean": "Mexico & Caribbean",
  "central-south-america": "Central & South America",
  europe: "Europe",
  "middle-east-africa": "Middle East & Africa",
  asia: "Asia",
  oceania: "Australia & Oceania",
};

/** Visual theme for generated artwork (no photos required). */
export type HeroTheme =
  | "city"
  | "beach"
  | "tropical"
  | "mountain"
  | "desert"
  | "historic"
  | "nightlife"
  | "nature";

export interface FAQ {
  question: string;
  answer: string;
}

export interface Destination {
  /** URL slug, e.g. "los-angeles". Unique. */
  slug: string;
  city: string;
  /** Two-letter state code (US) or province/territory code (Canada). */
  state?: string;
  country: string;
  countryCode: string;
  region: Region;
  /** IATA codes serving the city, primary airport first. Must exist in `data/airports.ts`. */
  airports: string[];
  /** Short hook, ≤ 60 chars, e.g. "Sun, surf and the Hollywood sign". */
  tagline: string;
  /** 2–3 sentence overview for cards and meta descriptions (≤ 320 chars). */
  summary: string;
  /** 3–5 paragraphs of genuinely useful, specific travel writing. */
  overview: string[];
  heroTheme: HeroTheme;
  /** Two hex colours for the generated card/hero artwork. */
  gradient: [string, string];
  bestTimeToVisit: string;
  /** Typical lowest round-trip economy fares from major US origins (realistic estimates in USD). */
  typicalFares: { origin: string; price: number }[];
  /** Average flight time in minutes from the listed origin. */
  flightTimes: { origin: string; minutes: number }[];
  highlights: { title: string; description: string }[];
  travelTips: string[];
  neighborhoods?: string[];
  /** Seasonal weather: exactly 4 entries (Winter, Spring, Summer, Fall). */
  weather: {
    season: "Winter" | "Spring" | "Summer" | "Fall";
    highF: number;
    lowF: number;
    note: string;
  }[];
  faqs: FAQ[];
  /** Featured on the home page / hubs. */
  popular: boolean;
  /** Search intent keywords used in titles/descriptions. */
  keywords: string[];
}

export type RouteCategory = "domestic" | "transborder" | "international";

/** Human labels for route categories, used on every page that shows one. */
export const ROUTE_CATEGORY_LABELS: Record<RouteCategory, string> = {
  domestic: "Domestic",
  transborder: "US–Canada",
  international: "International",
};

export interface RouteDef {
  origin: string; // IATA
  destination: string; // IATA
  /** Show in "popular routes" modules. */
  popular?: boolean;
  /**
   * "domestic" means within one country — a Toronto–Vancouver flight is
   * domestic to the traveler taking it, not international. US–Canada pairs
   * are "transborder", which is the industry term and what the fare rules,
   * preclearance and baggage allowances actually follow.
   */
  category: RouteCategory;
}

export interface FAQGroup {
  id: string;
  title: string;
  items: FAQ[];
}

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface Article {
  /** URL slug under /travel-guides/, unique. */
  slug: string;
  title: string; // ≤ 65 chars
  description: string; // ≤ 155 chars
  category: "tips" | "guides" | "airports" | "airlines";
  publishedAt: string; // YYYY-MM-DD
  updatedAt: string; // YYYY-MM-DD
  author: { name: string; role: string };
  readingMinutes: number;
  heroTheme: HeroTheme;
  gradient: [string, string];
  /**
   * A concrete, photographable subject for the hero image, e.g. "airport
   * departure board". Titles like "Basic Economy vs Main Cabin" return nothing
   * useful from a photo library, so each article names what to actually show.
   * Used by scripts/fetch-article-photos.mjs; falls back to generated art.
   */
  photoQuery?: string;
  /** Short intro paragraph shown above the fold. */
  intro: string;
  sections: ArticleSection[];
  /** Key takeaways shown in a call-out. */
  takeaways: string[];
  faqs?: FAQ[];
  /** Related route slugs like "new-york-to-los-angeles" or destination slugs. */
  relatedDestinations?: string[];
  keywords: string[];
}
