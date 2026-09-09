"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { isValidReference, normalizeReference } from "@/lib/booking/reference";

export function BookingLookupForm({ initialReference = "" }: { initialReference?: string }) {
  const router = useRouter();
  const [reference, setReference] = React.useState(normalizeReference(initialReference));
  const [lastName, setLastName] = React.useState("");
  const [errors, setErrors] = React.useState<{ reference?: string; lastName?: string }>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!isValidReference(reference)) errs.reference = "Enter the 8-character reference, e.g. A1K7M2QX";
    if (!lastName.trim()) errs.lastName = "Enter the lead passenger's last name";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setServerError(null);
    try {
      const res = await fetch("/api/bookings/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference, lastName }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't find that booking.");
      router.push(`/booking/${data.reference}`);
    } catch (err) {
      setServerError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4" aria-label="Find your booking">
      {serverError && <Alert tone="danger">{serverError}</Alert>}
      <Input
        label="Booking reference"
        hint="Starts with A1 — it's at the top of your confirmation email."
        value={reference}
        onChange={(e) => setReference(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))}
        error={errors.reference}
        autoComplete="off"
        autoCapitalize="characters"
        placeholder="A1K7M2QX"
        id="lookup-reference"
        className="font-mono uppercase tracking-widest"
      />
      <Input label="Last name of lead passenger" value={lastName} onChange={(e) => setLastName(e.target.value)} error={errors.lastName} autoComplete="family-name" id="lookup-lastname" />
      <Button type="submit" size="lg" full loading={loading} leftIcon={<Search className="h-5 w-5" aria-hidden />}>
        Find my booking
      </Button>
    </form>
  );
}
