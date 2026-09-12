/**
 * Central site configuration. Everything brand-related lives here so it can
 * be changed in one place (and read from env where it makes sense).
 */
// Canonical origin. Falls back to the Vercel-provided hostname so preview deploys
// get correct canonical/OG URLs before a custom domain is configured.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const rawUrl = (process.env.NEXT_PUBLIC_SITE_URL || (vercelHost ? `https://${vercelHost}` : ""))?.replace(/\/+$/, "");

export const site = {
  name: "Air1 Tickets",
  legalName: "Air1 Tickets LLC",
  shortName: "Air1",
  tagline: "Fly for less. Book with confidence.",
  description:
    "Air1 Tickets is a US-based online travel agency. Compare hundreds of airlines, find the cheapest flights and book in minutes — with 24/7 US-based support.",
  url: rawUrl && rawUrl.length > 0 ? rawUrl : "http://localhost:3000",
  locale: "en_US",
  language: "en-US",
  currency: "USD",
  country: "US",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "+1 (942) 338-2017",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@air1tickets.com",
  address: {
    streetAddress: "1250 Market Street, Suite 400",
    addressLocality: "San Francisco",
    addressRegion: "CA",
    postalCode: "94102",
    addressCountry: "US",
  },
  founded: "2018",
  social: {
    twitter: "https://x.com/air1tickets",
    facebook: "https://www.facebook.com/air1tickets",
    instagram: "https://www.instagram.com/air1tickets",
    linkedin: "https://www.linkedin.com/company/air1tickets",
  },
  twitterHandle: "@air1tickets",
  /**
   * How travelers convert. "lead": travelers lock a fare and talk to an agent
   * (WhatsApp / Messenger / call) who sends a last-minute deal; the site never
   * takes payment. "checkout": the full self-service booking flow.
   */
  bookingMode: (process.env.NEXT_PUBLIC_BOOKING_MODE === "checkout" ? "checkout" : "lead") as "lead" | "checkout",
  /**
   * What the big "Search" button does. "whatsapp" (default): opens WhatsApp
   * with the whole request typed out, so an agent can quote a last-minute deal.
   * "results": shows the on-site fare results page instead.
   */
  searchMode: (process.env.NEXT_PUBLIC_SEARCH_MODE === "results" ? "results" : "whatsapp") as "whatsapp" | "results",
  chat: {
    /** E.164 digits only, e.g. 19423382017 (country code + number). */
    whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+1 942-338-2017").replace(/[^\d]/g, ""),
    /** The same number formatted for display. */
    whatsappDisplay: process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY ?? "+1 (942) 338-2017",
    /** Facebook Page username for m.me links. */
    messenger: process.env.NEXT_PUBLIC_MESSENGER_PAGE ?? "air1tickets",
    /** Optional Telegram username (without @). */
    telegram: process.env.NEXT_PUBLIC_TELEGRAM_USERNAME ?? "",
  },
  priceLock: {
    /** How long a locked fare is honored, in hours. */
    hours: Number(process.env.NEXT_PUBLIC_PRICE_LOCK_HOURS ?? 48),
    /** Promised first response time for a new lock, in minutes. */
    responseMinutes: Number(process.env.NEXT_PUBLIC_LOCK_RESPONSE_MINUTES ?? 15),
    /** Where new leads are emailed. */
    leadsEmail: process.env.LEADS_EMAIL ?? process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@air1tickets.com",
  },
} as const;

export const isLeadMode = site.bookingMode === "lead";
export const searchGoesToWhatsApp = site.searchMode === "whatsapp";

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
