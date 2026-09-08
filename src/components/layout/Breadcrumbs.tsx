import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo/jsonld";
import { cn } from "@/lib/utils";

/** Visible breadcrumbs + BreadcrumbList JSON-LD. Pass the full trail including "Home". */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm text-slate-500", className)}>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden />}
              {last ? (
                <span aria-current="page" className="font-medium text-navy-900">
                  {c.name}
                </span>
              ) : (
                <Link href={c.path} className="hover:text-navy-900 hover:underline underline-offset-4">
                  {i === 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Home className="h-3.5 w-3.5" aria-hidden />
                      <span>{c.name}</span>
                    </span>
                  ) : (
                    c.name
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
