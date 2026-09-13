"use client";

import { Clock, Tag } from "lucide-react";
import { useOffer } from "@/lib/promo/claim";
import { formatCountdown, promo } from "@/lib/promo/offer";
import { cn } from "@/lib/utils";

/**
 * The offer, restated next to the search form.
 *
 * The bar at the top of the page establishes the offer; this puts it back in
 * front of the visitor at the moment they are deciding whether to fill the
 * form in. It renders nothing for organic visitors, so an unpaid visit never
 * sees a claim about an ad it did not come from.
 */
export function OfferCallout({
  className,
  onDark = true,
}: {
  className?: string;
  onDark?: boolean;
}) {
  const { offer, remainingMs, expired } = useOffer();
  if (!offer || expired) return null;
  const countdown = formatCountdown(remainingMs);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl px-3.5 py-2.5 text-sm",
        onDark
          ? "bg-sunrise-400/15 text-sunrise-100 ring-1 ring-sunrise-300/30"
          : "bg-sunrise-50 text-sunrise-900 ring-1 ring-sunrise-200",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5 font-semibold">
        <Tag className="h-4 w-4 shrink-0" aria-hidden />
        {offer.eyebrow}
      </span>
      <span className={onDark ? "text-white/85" : "text-slate-700"}>
        Up to {promo.discount}% off public fares with code{" "}
        <span
          className={cn(
            "rounded px-1.5 py-0.5 font-mono text-xs font-bold tracking-wide",
            onDark
              ? "bg-white/15 text-white"
              : "bg-sunrise-100 text-sunrise-900",
          )}
        >
          {offer.code}
        </span>
        {" — it goes into your message automatically."}
      </span>
      {countdown && (
        <span
          className={cn(
            "inline-flex items-center gap-1 whitespace-nowrap tabular-nums",
            onDark ? "text-sunrise-200" : "text-sunrise-700",
          )}
        >
          <Clock className="h-3.5 w-3.5" aria-hidden />
          <span className="sr-only">Time remaining: </span>
          {countdown}
        </span>
      )}
    </div>
  );
}
