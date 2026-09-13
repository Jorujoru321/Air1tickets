import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

/**
 * Air1 Tickets identity.
 *
 * The mark is a folded paper plane built from two triangles that share a
 * crease: a white upper wing and a sunrise-orange underside. Two flat shapes
 * on a gradient tile is deliberate — the mark has to survive at 16px in a
 * browser tab and as a 32px avatar on WhatsApp Business, and detail at that
 * size turns to mud. The diagonal climb is the only gesture doing work.
 *
 * Drawn inline rather than loaded as a file so it inherits size from the
 * caller, needs no network request on first paint, and cannot 404 under a
 * base path.
 */
export function LogoMark({ className, id = "a1" }: { className?: string; id?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("h-9 w-9", className)} aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${id}-tile`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f93ef" />
          <stop offset="0.55" stopColor="#1a75d8" />
          <stop offset="1" stopColor="#12244a" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill={`url(#${id}-tile)`} />
      {/* Upper wing — the big readable shape. */}
      <path d="M41 7 7 23l12.5 4Z" fill="#fff" />
      {/* Folded underside, in the accent colour. */}
      <path d="M41 7 19.5 27 25 41Z" fill="#ff6b35" />
    </svg>
  );
}

export function Logo({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label={`${site.name} — home`}>
      <LogoMark />
      <span className={cn("font-display text-[22px] font-extrabold leading-none tracking-[-0.02em]", inverse ? "text-white" : "text-navy-900")}>
        Air1
        <span className={cn("ml-1.5 font-medium tracking-normal", inverse ? "text-white/65" : "text-slate-500")}>Tickets</span>
      </span>
    </Link>
  );
}
