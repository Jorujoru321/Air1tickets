/**
 * Ad-referral offers.
 *
 * Someone who clicks a paid ad cost you money to get here. This module
 * recognises that click, shows them an offer the ad promised, and carries the
 * code into the WhatsApp thread so the agent quoting the trip knows to honour
 * it. Without the last part the offer is decoration — the agent never sees it.
 *
 * Everything is configured through env so the offer can change with the
 * campaign without a code change.
 *
 * ---------------------------------------------------------------------------
 * A discount claim is an advertising claim. "Up to 50% off public fares" has
 * to be true for a meaningful number of the travelers who see it, and you need
 * evidence — a screenshot of the public fare at the moment you quoted. The FTC
 * Guides Against Deceptive Pricing (16 CFR Part 233) are about exactly this,
 * and a percentage off a price nobody ever charged is the textbook violation.
 * Set PROMO_DISCOUNT to a number your agents actually beat.
 * ---------------------------------------------------------------------------
 */

/** Where a visitor arrived from, when we can tell. */
export type ReferralSource = "meta" | "google" | "tiktok" | "email" | "direct";

export interface Offer {
  /** Code the traveler quotes and the agent looks for. */
  code: string;
  /** Small label above the headline. */
  eyebrow: string;
  /** The offer itself, one line. */
  headline: string;
  /** Supporting line — what to do next. */
  subline: string;
  /** Where it came from, for reporting. */
  source: ReferralSource;
}

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const promo = {
  /** Master switch. Turn the whole mechanic off without removing it. */
  enabled: process.env.NEXT_PUBLIC_PROMO_ENABLED !== "0",
  /**
   * The headline number. This is an advertising claim — see the note above.
   * Phrased as "up to", which is what makes it defensible when some trips
   * save less.
   */
  discount: num(process.env.NEXT_PUBLIC_PROMO_DISCOUNT, 50),
  /**
   * How long the offer is held after the click, in hours. The countdown on the
   * page uses this and it genuinely expires — a timer that resets on refresh
   * is a dark pattern, and state AGs have brought cases over them.
   */
  hours: num(process.env.NEXT_PUBLIC_PROMO_HOURS, 24),
  /** Per-channel codes, so you can see in WhatsApp which ad produced the lead. */
  codes: {
    meta: process.env.NEXT_PUBLIC_PROMO_CODE_META ?? "META50",
    google: process.env.NEXT_PUBLIC_PROMO_CODE_GOOGLE ?? "SEARCH50",
    tiktok: process.env.NEXT_PUBLIC_PROMO_CODE_TIKTOK ?? "TIKTOK50",
    email: process.env.NEXT_PUBLIC_PROMO_CODE_EMAIL ?? "INBOX50",
    direct: process.env.NEXT_PUBLIC_PROMO_CODE_DIRECT ?? "AIR1",
  } satisfies Record<ReferralSource, string>,
} as const;

/** Milliseconds an offer stays live. */
export const promoWindowMs = promo.hours * 60 * 60 * 1000;

const SOURCE_PATTERNS: {
  source: ReferralSource;
  params: string[];
  values: RegExp;
}[] = [
  {
    source: "meta",
    params: ["utm_source", "utm_medium"],
    values: /^(facebook|fb|instagram|ig|meta)/i,
  },
  {
    source: "google",
    params: ["utm_source"],
    values: /^(google|adwords|gads)/i,
  },
  { source: "tiktok", params: ["utm_source"], values: /^tiktok/i },
  { source: "email", params: ["utm_medium"], values: /^(email|newsletter)/i },
];

/** Click IDs each network appends automatically — the most reliable signal. */
const CLICK_IDS: { source: ReferralSource; param: string }[] = [
  { source: "meta", param: "fbclid" },
  { source: "google", param: "gclid" },
  { source: "google", param: "gbraid" },
  { source: "google", param: "wbraid" },
  { source: "tiktok", param: "ttclid" },
];

/**
 * Which paid channel sent this visitor, from the URL alone.
 *
 * Returns null for organic traffic, which is the point: someone who found you
 * on Google should not see an offer that claims to come from an ad they never
 * clicked. That claim would be false, and it trains everyone to ignore it.
 */
export function referralSource(search: string): ReferralSource | null {
  const q = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );

  // An explicit ?offer=META50 always wins — it is how you link from anywhere.
  const explicit = q.get("offer")?.trim().toUpperCase();
  if (explicit) {
    const match = (
      Object.entries(promo.codes) as [ReferralSource, string][]
    ).find(([, code]) => code.toUpperCase() === explicit);
    if (match) return match[0];
    return "direct";
  }

  for (const { source, param } of CLICK_IDS) {
    if (q.get(param)) return source;
  }
  for (const { source, params, values } of SOURCE_PATTERNS) {
    if (params.some((p) => values.test(q.get(p) ?? ""))) return source;
  }
  return null;
}

/** The campaign name, when the ad passes one, so leads can be attributed. */
export function campaignName(search: string): string | null {
  const q = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  return q.get("utm_campaign")?.trim() || null;
}

const COPY: Record<
  ReferralSource,
  { eyebrow: string; headline: string; subline: string }
> = {
  meta: {
    eyebrow: "Ad rate unlocked",
    headline: `You came from our ad — up to ${promo.discount}% off public fares across North America`,
    subline:
      "Send us your trip and an agent quotes the ad rate, not the screen price.",
  },
  google: {
    eyebrow: "Search rate unlocked",
    headline: `Your search rate is active — up to ${promo.discount}% off public fares`,
    subline:
      "Tell us where you're going. An agent prices it against what you'd pay online.",
  },
  tiktok: {
    eyebrow: "Ad rate unlocked",
    headline: `You came from our ad — up to ${promo.discount}% off public fares`,
    subline: "One message and an agent works your dates for the ad rate.",
  },
  email: {
    eyebrow: "Subscriber rate",
    headline: `Your subscriber rate is active — up to ${promo.discount}% off public fares`,
    subline: "Reply with your trip and we'll quote it at the subscriber rate.",
  },
  direct: {
    eyebrow: "Offer applied",
    headline: `Your code is active — up to ${promo.discount}% off public fares`,
    subline: "Send us the trip and an agent quotes it with your code applied.",
  },
};

/** The offer to show a visitor from a given channel. */
export function offerFor(source: ReferralSource): Offer {
  return { code: promo.codes[source], source, ...COPY[source] };
}

/** One line appended to the WhatsApp message so the agent honours the code. */
export function offerMessageLine(offer: Offer): string {
  return `🎟️ Offer code: ${offer.code} (up to ${promo.discount}% off — from your ${offer.source === "email" ? "email" : "ad"})`;
}

/** "23:41:08" from milliseconds remaining. Returns null once expired. */
export function formatCountdown(msRemaining: number): string | null {
  if (msRemaining <= 0) return null;
  const total = Math.floor(msRemaining / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
