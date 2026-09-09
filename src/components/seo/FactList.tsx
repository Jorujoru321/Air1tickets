import { cn } from "@/lib/utils";

export interface FactItem {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

/**
 * Definition-list style facts grid (airline / airport / destination quick facts).
 * Each item is a single <div> holding only <dt>/<dd> children, which keeps the
 * list valid for assistive tech (axe "definition-list" / "dlitem" rules).
 */
export function FactList({ items, columns = 3, className }: { items: FactItem[]; columns?: 2 | 3 | 4; className?: string }) {
  const cols = columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <dl className={cn("grid gap-3", cols, className)}>
      {items.map((f) => (
        <div key={f.label} className={cn("grid gap-x-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card", f.icon ? "grid-cols-[2.5rem_1fr]" : "grid-cols-1")}>
          <dt className={cn("text-xs font-semibold uppercase tracking-wide text-slate-500", f.icon && "col-start-2")}>{f.label}</dt>
          {f.icon && (
            <dd className="col-start-1 row-span-2 row-start-1 flex h-10 w-10 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
              <f.icon className="h-5 w-5" aria-hidden />
            </dd>
          )}
          <dd className={cn("mt-0.5 min-w-0 text-sm font-semibold text-navy-900", f.icon && "col-start-2")}>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
