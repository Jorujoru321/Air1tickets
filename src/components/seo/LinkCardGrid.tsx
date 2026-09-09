import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LinkCardItem {
  href: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-hand slot, e.g. a price or an airport code. */
  aside?: React.ReactNode;
  /** Optional leading visual (logo, icon). */
  leading?: React.ReactNode;
  key?: string;
}

/** Responsive grid of link cards used for route / city / airport / airline lists. */
export function LinkCardGrid({ items, columns = 3, className, ariaLabel }: { items: LinkCardItem[]; columns?: 2 | 3 | 4; className?: string; ariaLabel?: string }) {
  if (!items.length) return null;
  const cols = columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <ul className={cn("grid gap-3", cols, className)} aria-label={ariaLabel}>
      {items.map((it, i) => (
        <li key={it.key ?? `${it.href}-${i}`}>
          <Link href={it.href} className="group flex h-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-xs transition hover:border-ocean-300 hover:shadow-card">
            <span className="flex min-w-0 items-center gap-3">
              {it.leading}
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-navy-900">{it.title}</span>
                {it.subtitle && <span className="block truncate text-xs text-slate-500">{it.subtitle}</span>}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {it.aside && <span className="text-right text-sm font-bold tabular-nums text-navy-900">{it.aside}</span>}
              <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-ocean-600" aria-hidden />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Compact inline list of text links, for dense "see also" modules. */
export function InlineLinkList({ items, className }: { items: { href: string; label: string }[]; className?: string }) {
  if (!items.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-2 text-sm", className)}>
      {items.map((it) => (
        <li key={it.href}>
          <Link href={it.href} className="font-medium text-ocean-700 underline-offset-4 hover:underline">
            {it.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
