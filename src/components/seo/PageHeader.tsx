import type * as React from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import type { Crumb } from "@/lib/seo/jsonld";
import { cn } from "@/lib/utils";

/**
 * Standard header for SEO pages: breadcrumbs, single H1, lead paragraph and
 * an optional slot (usually the compact search form). Keeps every page's
 * above-the-fold layout consistent.
 */
export function PageHeader({
  crumbs,
  eyebrow,
  title,
  lead,
  aside,
  children,
  className,
}: {
  crumbs?: Crumb[];
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** Rendered to the right of the title on large screens (e.g. a fare badge). */
  aside?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("border-b border-slate-200/80 bg-white", className)}>
      <div className="container-page pb-8 pt-6 sm:pt-8">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <div className={cn("mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", !crumbs && "mt-0")}>
          <div className="max-w-3xl">
            {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ocean-700">{eyebrow}</p>}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] lg:leading-[1.1]">{title}</h1>
            {lead && <p className="mt-3 text-base text-slate-600 sm:text-lg">{lead}</p>}
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  );
}
