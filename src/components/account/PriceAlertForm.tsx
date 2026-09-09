"use client";

import * as React from "react";
import { BellRing, PlaneLanding, PlaneTakeoff } from "lucide-react";
import type { Airport } from "@/lib/flights/types";
import { AirportAutocomplete, DatePicker } from "@/components/search";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { addDays, toDateOnly } from "@/lib/utils";

export function PriceAlertForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [origin, setOrigin] = React.useState<Airport | null>(null);
  const [destination, setDestination] = React.useState<Airport | null>(null);
  const [dates, setDates] = React.useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const [email, setEmail] = React.useState(defaultEmail);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [state, setState] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const start = addDays(toDateOnly(new Date()), 30);
    setDates({ start, end: addDays(start, 7) });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!origin) errs.origin = "Choose a departure airport";
    if (!destination) errs.destination = "Choose a destination";
    if (!dates.start) errs.depart = "Choose a date";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = "Enter a valid email";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState("loading");
    try {
      const res = await fetch("/api/price-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, origin: origin!.iata, destination: destination!.iata, departDate: dates.start, returnDate: dates.end }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save the alert.");
      setState("done");
    } catch (err) {
      setState("error");
      setMessage((err as Error).message);
    }
  }

  if (state === "done") {
    return (
      <Alert tone="success" title="Alert saved">
        We&apos;ll email {email} when fares from {origin?.city} to {destination?.city} drop for your dates.
      </Alert>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-label="Create a price alert">
      {state === "error" && <Alert tone="danger">{message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <AirportAutocomplete id="alert-from" label="From" value={origin} onChange={setOrigin} exclude={destination?.iata} icon={<PlaneTakeoff className="h-5 w-5" aria-hidden />} error={errors.origin} compact />
        <AirportAutocomplete id="alert-to" label="To" value={destination} onChange={setDestination} exclude={origin?.iata} icon={<PlaneLanding className="h-5 w-5" aria-hidden />} error={errors.destination} compact />
      </div>
      <DatePicker id="alert-dates" mode="range" value={dates} onChange={setDates} origin={origin?.iata} destination={destination?.iata} compact errorStart={errors.depart} />
      <Input id="alert-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" />
      <Button type="submit" size="lg" loading={state === "loading"} leftIcon={<BellRing className="h-5 w-5" aria-hidden />}>
        Create price alert
      </Button>
    </form>
  );
}
