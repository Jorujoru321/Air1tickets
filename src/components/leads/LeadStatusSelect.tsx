"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const STATUSES = ["new", "contacted", "quoted", "won", "lost"] as const;
type Status = (typeof STATUSES)[number];

const TONE: Record<Status, string> = {
  new: "bg-sunrise-100 text-sunrise-800",
  contacted: "bg-ocean-100 text-ocean-800",
  quoted: "bg-navy-100 text-navy-800",
  won: "bg-success-50 text-success-700",
  lost: "bg-slate-100 text-slate-600",
};

/** Inline status control for the leads table; saves on change. */
export function LeadStatusSelect({ id, status, reference }: { id: string; status: Status; reference: string }) {
  const router = useRouter();
  const [value, setValue] = React.useState<Status>(status);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  async function change(next: Status) {
    const prev = value;
    setValue(next);
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Could not save");
      router.refresh();
    } catch (e) {
      setValue(prev);
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <select aria-label={`Status for lead ${reference}`} value={value} disabled={saving} onChange={(e) => change(e.target.value as Status)} className={cn("rounded-full border-0 px-2.5 py-1 text-xs font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-ocean-500/30", TONE[value])}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-danger-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
