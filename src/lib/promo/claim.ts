"use client";

import * as React from "react";
import {
  campaignName,
  offerFor,
  promo,
  promoWindowMs,
  referralSource,
  type Offer,
  type ReferralSource,
} from "@/lib/promo/offer";

/**
 * Holding an offer across the visit.
 *
 * The URL parameters that identify an ad click only exist on the landing page.
 * A visitor who lands on an ad, reads two route guides and then searches has
 * lost them by the time it matters, so the claim is stored on first sight and
 * read back everywhere else.
 *
 * The expiry is a real timestamp, written once. Refreshing does not extend it
 * and closing the tab does not reset it, so the countdown on screen is telling
 * the truth. That is the whole difference between urgency and a dark pattern.
 */

const KEY = "air1.offer.v1";

export interface ClaimedOffer extends Offer {
  /** Epoch ms when the offer was first shown. */
  claimedAt: number;
  /** Epoch ms when it stops applying. */
  expiresAt: number;
  /** utm_campaign, when the ad passed one. */
  campaign: string | null;
}

function read(): ClaimedOffer | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClaimedOffer;
    if (
      typeof parsed?.expiresAt !== "number" ||
      typeof parsed?.code !== "string"
    )
      return null;
    return parsed;
  } catch {
    return null;
  }
}

function write(offer: ClaimedOffer): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(offer));
  } catch {
    // Private browsing, storage full, or storage disabled. The offer simply
    // does not persist past this page, which is better than throwing.
  }
}

/** Forget the claim. Used when it expires so we stop showing a dead offer. */
export function clearClaim(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
}

/**
 * Record the offer for this visit if the URL says the visitor came from an ad.
 * Returns the live claim, expired or not, so callers can decide what to show.
 *
 * An existing unexpired claim is never overwritten by a later, different
 * source: the first ad that paid for the visit keeps the credit.
 */
export function claimFromUrl(search: string): ClaimedOffer | null {
  if (!promo.enabled) return null;
  const existing = read();
  if (existing && existing.expiresAt > Date.now()) return existing;

  const source = referralSource(search);
  if (!source) return existing;

  const now = Date.now();
  const claimed: ClaimedOffer = {
    ...offerFor(source),
    claimedAt: now,
    expiresAt: now + promoWindowMs,
    campaign: campaignName(search),
  };
  write(claimed);
  return claimed;
}

/**
 * Claim an offer for a channel outright, ignoring the URL.
 *
 * The ad landing page uses this: traffic sent straight to /offer may arrive
 * with its click ID stripped by an in-app browser or a link shortener, and the
 * page would otherwise show nothing to a visitor the ad just paid for.
 * An existing live claim still wins, so this never overwrites attribution.
 */
export function claimSource(
  source: ReferralSource,
  campaign?: string | null,
): ClaimedOffer | null {
  if (!promo.enabled) return null;
  const existing = read();
  if (existing && existing.expiresAt > Date.now()) return existing;
  const now = Date.now();
  const claimed: ClaimedOffer = {
    ...offerFor(source),
    claimedAt: now,
    expiresAt: now + promoWindowMs,
    campaign: campaign ?? null,
  };
  write(claimed);
  return claimed;
}

export interface OfferState {
  offer: ClaimedOffer | null;
  /** Milliseconds left, or 0 when expired or absent. */
  remainingMs: number;
  expired: boolean;
}

/**
 * The active offer, ticking once a second while one is live.
 *
 * Returns nothing on the server and on the first client render, which keeps
 * hydration identical on both sides — the bar fades in immediately after.
 */
export function useOffer(tick = true): OfferState {
  const [offer, setOffer] = React.useState<ClaimedOffer | null>(null);
  const [now, setNow] = React.useState(0);

  React.useEffect(() => {
    const claimed = claimFromUrl(window.location.search);
    setOffer(claimed);
    setNow(Date.now());
  }, []);

  const expiresAt = offer?.expiresAt ?? 0;
  React.useEffect(() => {
    if (!tick || !expiresAt) return;
    if (expiresAt <= Date.now()) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [tick, expiresAt]);

  if (!offer || !now) return { offer: null, remainingMs: 0, expired: false };
  const remainingMs = Math.max(0, offer.expiresAt - now);
  return { offer, remainingMs, expired: remainingMs <= 0 };
}

/**
 * Append the offer code to a WhatsApp message. Called at the moment the
 * message is built, so the agent on the other end sees the code the traveler
 * was promised and can honour it.
 */
export function withOfferLine(text: string): string {
  if (typeof window === "undefined" || !promo.enabled) return text;
  const claimed = read();
  if (!claimed || claimed.expiresAt <= Date.now()) return text;
  const line = `🎟️ Offer code: ${claimed.code}${claimed.campaign ? ` (${claimed.campaign})` : ""}`;
  return `${text}\n\n${line}`;
}

/** The stored claim, if any is still live. For analytics parameters. */
export function activeOfferCode(): string | null {
  if (typeof window === "undefined") return null;
  const claimed = read();
  return claimed && claimed.expiresAt > Date.now() ? claimed.code : null;
}

/** The channel of the live claim, for reporting which ad produced a lead. */
export function activeOfferSource(): ReferralSource | null {
  if (typeof window === "undefined") return null;
  const claimed = read();
  return claimed && claimed.expiresAt > Date.now() ? claimed.source : null;
}
