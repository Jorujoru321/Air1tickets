import { cn } from "@/lib/utils";

export interface FactItem {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

/** Definition-list style facts grid (airline / airport quick facts). */
export function FactList({ items, columns = 3, className }: { items: FactItem[]; columns?: 2 | 3 | 4; className?: string }) {
  const cols = columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <dl className={cn("grid gap-3", cols, className)}>
      {items.map((f) => (
        <div key={f.label} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          {f.icon && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
              <f.icon className="h-5 w-5" aria-hidden />
            </span>
          )}
          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{f.label}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-navy-900">{f.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
