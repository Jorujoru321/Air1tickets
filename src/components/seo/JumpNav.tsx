import { cn } from "@/lib/utils";

/** In-page anchor navigation for long index pages. */
export function JumpNav({ items, label = "Jump to section", className }: { items: { id: string; label: string }[]; label?: string; className?: string }) {
  if (!items.length) return null;
  return (
    <nav aria-label={label} className={cn("overflow-x-auto", className)}>
      <ul className="flex flex-wrap gap-2">
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-navy-900 transition hover:border-ocean-400 hover:bg-ocean-50">
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
