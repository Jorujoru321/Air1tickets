import { BadgeCheck, CreditCard, Timer } from "lucide-react";
import { promo } from "@/lib/promo/offer";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The three reasons to use the form, sitting directly above it.
 *
 * Green because it reads as "saving" at a glance, and placed where the eye
 * lands between the headline and the first field — the moment someone decides
 * whether filling this in is worth thirty seconds.
 *
 * The discount figure comes from `promo.discount`, the same value the ad
 * offer uses, so the site never advertises two different numbers. It is a
 * claim about real money: it needs to be true for a meaningful share of
 * travelers, and every instance of beating a public fare needs a screenshot
 * kept on file. See docs/AD-COPY.md.
 */
const TAGS = [
  { icon: BadgeCheck, label: `Up to ${promo.discount}% off public fares` },
  {
    icon: Timer,
    label: `Price back in ~${site.priceLock.responseMinutes} min`,
  },
  { icon: CreditCard, label: "No card to get a quote" },
];

export function ValueTags({
  className,
  onDark = true,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {TAGS.map((t) => (
        <li
          key={t.label}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
            onDark
              ? "bg-success-500/20 text-success-100 ring-1 ring-success-400/40"
              : "bg-success-50 text-success-700 ring-1 ring-success-200",
          )}
        >
          <t.icon
            className={cn(
              "h-3.5 w-3.5 shrink-0",
              onDark ? "text-success-300" : "text-success-600",
            )}
            aria-hidden
          />
          {t.label}
        </li>
      ))}
    </ul>
  );
}
