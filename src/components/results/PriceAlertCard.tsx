"use client";

import * as React from "react";
import { BellRing } from "lucide-react";
import type { SearchParams } from "@/lib/flights/types";
import { Button } from "@/components/ui/Button";
import { getAirport } from "@/data/airports";

export function PriceAlertCard({ params }: { params: SearchParams }) {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = React.useState("");
  const o = getAirport(params.origin);
  const d = getAirport(params.destination);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/price-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, origin: params.origin, destination: params.destination, departDate: params.departDate, returnDate: params.returnDate, cabin: params.cabin, passengers: params.passengers.adults + params.passengers.children }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't save that alert right now.");
      setState("done");
    } catch (err) {
      setState("error");
      setMessage((err as Error).message);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-ocean-200 bg-ocean-50/70 p-5 sm:flex-row sm:items-center">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-ocean-600 shadow-xs">
        <BellRing className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-navy-900">Track prices for {o?.city ?? params.origin} to {d?.city ?? params.destination}</p>
        <p className="text-sm text-slate-600">We&apos;ll email you when fares for these dates drop. No spam, unsubscribe any time.</p>
      </div>
      {state === "done" ? (
        <p className="text-sm font-semibold text-success-700" role="status">
          Alert saved — watch your inbox.
        </p>
      ) : (
        <form onSubmit={submit} className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <label htmlFor="price-alert-email" className="sr-only">
            Email address
          </label>
          <input
            id="price-alert-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 rounded-[var(--radius-field)] border border-slate-300 bg-white px-3.5 text-sm text-navy-900 placeholder:text-slate-400 focus:border-ocean-500 focus:outline-none focus:ring-3 focus:ring-ocean-500/20 sm:w-56"
          />
          <Button type="submit" variant="secondary" loading={state === "loading"}>
            Set alert
          </Button>
          {state === "error" && (
            <p className="text-xs text-danger-600 sm:basis-full" role="alert">
              {message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
