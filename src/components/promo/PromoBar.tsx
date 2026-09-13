"use client";

import * as React from "react";
import { Clock, Tag, X } from "lucide-react";
import { useOffer } from "@/lib/promo/claim";
import { formatCountdown } from "@/lib/promo/offer";
import { whatsappLink } from "@/lib/leads/chat-links";
import { track } from "@/lib/analytics/events";
import { site } from "@/lib/site";

const DISMISSED = "air1.offer.dismissed.v1";

/**
 * The band a visitor sees when they arrive from a paid ad.
 *
 * It runs above the header and scrolls away rather than pinning, because the
 * page already has a persistent chat button and two fixed elements competing
 * for the top of a phone screen is how you lose the search form.
 *
 * The countdown is real. When it runs out the bar says so instead of quietly
 * restarting, and still offers a way through — an expired offer is a reason to
 * message, not a reason to bounce.
 */
export function PromoBar() {
  const { offer, remainingMs, expired } = useOffer();
  const [dismissed, setDismissed] = React.useState(true);
  const seen = React.useRef(false);

  React.useEffect(() => {
    try {
      setDismissed(window.sessionStorage.getItem(DISMISSED) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  React.useEffect(() => {
    if (!offer || dismissed || seen.current) return;
    seen.current = true;
    track("promo_shown", {
      placement: "promo_bar",
      offer_code: offer.code,
      source: offer.source,
      campaign: offer.campaign ?? undefined,
    });
  }, [offer, dismissed]);

  if (!offer || dismissed) return null;

  const countdown = formatCountdown(remainingMs);
  const message = expired
    ? `Hi ${site.name}! I came from your ad (code ${offer.code}). I know it's expired — can you still help with my trip?`
    : `Hi ${site.name}! I came from your ad. My offer code is ${offer.code}. I'd like a quote for:`;

  function close() {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISSED, "1");
    } catch {}
  }

  return (
    <div
      className="relative z-50 bg-gradient-to-r from-sunrise-500 via-sunrise-400 to-sunrise-500 text-navy-950"
      role="region"
      aria-label="Offer from the ad you clicked"
    >
      <div className="container-page flex items-center gap-3 py-2.5 pr-9 text-sm sm:justify-center">
        <Tag className="h-4 w-4 shrink-0" aria-hidden />
        {expired ? (
          <p className="font-semibold">
            Your {offer.code} rate has expired —{" "}
            <a
              href={whatsappLink(message)}
              target="_blank"
              rel="noopener"
              onClick={() =>
                track("chat_click", {
                  placement: "promo_bar_expired",
                  offer_code: offer.code,
                })
              }
              className="underline underline-offset-2 hover:no-underline"
            >
              message us anyway
            </a>
            , we&apos;ll see what we can do.
          </p>
        ) : (
          <p className="font-semibold">
            <span className="hidden sm:inline">{offer.headline}. </span>
            <span className="sm:hidden">{offer.eyebrow}. </span>
            Code{" "}
            <span className="rounded bg-navy-950/10 px-1.5 py-0.5 font-mono text-xs font-bold tracking-wide">
              {offer.code}
            </span>
            {countdown && (
              <span className="ml-2 inline-flex items-center gap-1 whitespace-nowrap tabular-nums">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only">Time remaining: </span>
                {countdown}
              </span>
            )}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={close}
        aria-label="Dismiss offer"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-navy-950/70 transition hover:bg-navy-950/10 hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-950"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
