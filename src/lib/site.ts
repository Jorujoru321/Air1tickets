/**
 * Central site configuration. Everything brand-related lives here so it can
 * be changed in one place (and read from env where it makes sense).
 */
// Canonical origin. Falls back to the Vercel-provided hostname so preview deploys
// get correct canonical/OG URLs before a custom domain is configured.
const vercelHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const rawUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelHost ? `https://${vercelHost}` : "")
)?.replace(/\/+$/, "");

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
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@air1tickets.com",
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
  bookingMode: (process.env.NEXT_PUBLIC_BOOKING_MODE === "checkout"
    ? "checkout"
    : "lead") as "lead" | "checkout",
  /**
   * What the big "Search" button does. "whatsapp" (default): opens WhatsApp
   * with the whole request typed out, so an agent can quote a last-minute deal.
   * "results": shows the on-site fare results page instead.
   */
  searchMode: (process.env.NEXT_PUBLIC_SEARCH_MODE === "results"
    ? "results"
    : "whatsapp") as "whatsapp" | "results",
  chat: {
    /** E.164 digits only, e.g. 19423382017 (country code + number). */
    whatsapp: (
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+1 942-338-2017"
    ).replace(/[^\d]/g, ""),
    /** The same number formatted for display. */
    whatsappDisplay:
      process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY ?? "+1 (942) 338-2017",
    /** Facebook Page username for m.me links. */
    messenger: process.env.NEXT_PUBLIC_MESSENGER_PAGE ?? "air1tickets",
    /** Optional Telegram username (without @). */
    telegram: process.env.NEXT_PUBLIC_TELEGRAM_USERNAME ?? "",
  },
  priceLock: {
    /** How long a locked fare is honored, in hours. */
    hours: Number(process.env.NEXT_PUBLIC_PRICE_LOCK_HOURS ?? 48),
    /** Promised first response time for a new lock, in minutes. */
    responseMinutes: Number(
      process.env.NEXT_PUBLIC_LOCK_RESPONSE_MINUTES ?? 15,
    ),
    /** Where new leads are emailed. */
    leadsEmail:
      process.env.LEADS_EMAIL ??
      process.env.NEXT_PUBLIC_SUPPORT_EMAIL ??
      "support@air1tickets.com",
  },
} as const;

export const isLeadMode = site.bookingMode === "lead";
export const searchGoesToWhatsApp = site.searchMode === "whatsapp";

/**
 * True in the static GitHub Pages preview, which has no server: pages that
 * need a database or an API route are not built, so links to them are hidden
 * and trip deep links go to WhatsApp instead.
 */
export const isStaticPreview = process.env.NEXT_PUBLIC_STATIC_PREVIEW === "1";

/**
 * True when the build serves pages at /path/ rather than /path (Next's
 * `trailingSlash`). The static GitHub Pages export turns it on, so canonical
 * URLs, Open Graph URLs, JSON-LD and the sitemap have to match or every page
 * advertises a URL that redirects.
 */
export const trailingSlash = process.env.NEXT_PUBLIC_TRAILING_SLASH === "1";

/**
 * Canonical form of a site path. Adds the trailing slash when the build uses
 * them, but never to something that is not a page: anything carrying a query
 * string, a fragment, or a file extension is left exactly as given.
 */
export function canonicalPath(path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!trailingSlash) return p;
  if (p === "/" || p.endsWith("/")) return p;
  if (/[?#]/.test(p) || /\.[a-z0-9]{2,5}$/i.test(p)) return p;
  return `${p}/`;
}

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${site.url}${canonicalPath(path)}`;
}

/**
 * Base path the build is served under, e.g. "/Air1tickets" on GitHub Pages and
 * "" on a real domain. Next rewrites hrefs in <Link> and files it imports, but
 * NOT a plain `<img src="/images/x.jpg">` — those need this prefix or they 404
 * on every page of a project-pages deployment.
 */
export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(
  /\/$/,
  "",
);

/** URL for a file in public/. Always pass static asset paths through this. */
export function asset(path: string): string {
  if (!path || /^(https?:)?\/\//i.test(path) || path.startsWith("data:"))
    return path;
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
