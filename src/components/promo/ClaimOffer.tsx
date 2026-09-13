"use client";

import * as React from "react";
import {
  campaignName,
  referralSource,
  type ReferralSource,
} from "@/lib/promo/offer";
import { claimFromUrl, claimSource } from "@/lib/promo/claim";

/**
 * Turns the offer on for a landing page that paid traffic is sent to directly.
 *
 * Renders nothing. It exists because click IDs go missing more often than you
 * would think — in-app browsers strip them, link shorteners drop them, and
 * some visitors paste the URL to a friend. On a page that only paid ads link
 * to, assuming the visit was paid for is the right default.
 */
export function ClaimOffer({ source = "meta" }: { source?: ReferralSource }) {
  React.useEffect(() => {
    const search = window.location.search;
    // A real referral in the URL is always more accurate than the fallback.
    if (referralSource(search)) claimFromUrl(search);
    else claimSource(source, campaignName(search));
  }, [source]);
  return null;
}
