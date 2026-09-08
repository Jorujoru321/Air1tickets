import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

/** Air1 Tickets logo mark + wordmark (inline SVG, theme-able). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("h-9 w-9", className)} aria-hidden focusable="false">
      <defs>
        <linearGradient id="a1g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f93ef" />
          <stop offset="1" stopColor="#1a75d8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#a1g)" />
      <path d="M13 33.5 31.5 15h-8.2L19 19.3h-4.6L22.6 9h13.9L18.3 33.5H13Z" fill="#fff" opacity=".95" />
      <path d="M27.6 39 36 23.6h-3.1l-2.6 4.7h-2.6L34 18h6.3L32.4 39h-4.8Z" fill="#ff6b35" />
    </svg>
  );
}

export function Logo({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label={`${site.name} — home`}>
      <LogoMark />
      <span className={cn("font-display text-[22px] font-extrabold leading-none tracking-tight", inverse ? "text-white" : "text-navy-900")}>
        Air1<span className={cn("ml-1 font-semibold", inverse ? "text-white/70" : "text-slate-500")}>Tickets</span>
      </span>
    </Link>
  );
}
