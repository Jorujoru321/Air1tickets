/**
 * Brands we shop when an agent prices a trip, shown as a "rates compared
 * across" strip on the home, hotels and activities pages.
 *
 * IMPORTANT — logos: these render as plain text wordmarks in our own
 * typeface, not as the brands' logo artwork, because those logos are
 * trademarks we have no licence to reproduce. If you have permission to use a
 * brand's real logo, drop the file at `public/partners/<slug>.svg` and set
 * `hasLogoFile: true` here; the component uses the image instead of the text.
 * Only list brands you genuinely shop for customers.
 */
export interface Partner {
  slug: string;
  name: string;
  category: "hotels" | "flights" | "activities" | "marketplace";
  /** Set by scripts/fetch-brand-logos.mjs once a real logo file exists. */
  hasLogoFile?: boolean;
  logoExt?: "svg" | "png";
}

/** Path to a partner's logo file, or null when we only have the name. */
export function partnerLogo(p: Partner): string | null {
  return p.hasLogoFile ? `/partners/${p.slug}.${p.logoExt ?? "svg"}` : null;
}

export const PARTNERS: Partner[] = [
  { slug: "expedia", name: "Expedia", category: "marketplace" },
  { slug: "booking", name: "Booking.com", category: "marketplace" },
  { slug: "hyatt", name: "Hyatt", category: "hotels" },
  { slug: "marriott", name: "Marriott", category: "hotels" },
  { slug: "hilton", name: "Hilton", category: "hotels" },
  { slug: "ihg", name: "IHG", category: "hotels" },
  { slug: "wyndham", name: "Wyndham", category: "hotels" },
  { slug: "accor", name: "Accor", category: "hotels" },
  { slug: "delta", name: "Delta", category: "flights" },
  { slug: "american", name: "American", category: "flights" },
  { slug: "united", name: "United", category: "flights" },
  { slug: "jetblue", name: "JetBlue", category: "flights" },
  { slug: "southwest", name: "Southwest", category: "flights" },
  { slug: "alaska", name: "Alaska", category: "flights" },
  { slug: "viator", name: "Viator", category: "activities" },
  { slug: "getyourguide", name: "GetYourGuide", category: "activities" },
];

export function partnersFor(...categories: Partner["category"][]): Partner[] {
  return PARTNERS.filter((p) => categories.includes(p.category));
}
