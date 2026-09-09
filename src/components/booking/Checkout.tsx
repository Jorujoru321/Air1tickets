"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, RefreshCw } from "lucide-react";
import type { ExtrasInput, ExtrasPricing, Offer } from "@/lib/flights/types";
import { isDomesticUS } from "@/data/airports";
import { defaultExtras, summarizePrice } from "@/lib/booking/pricing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { contactSchema, emptyPassenger, expectedPassengerTypes, passengerAgeProblem, passengerSchema, passportProblems, passportRequired, type PassengerFormValues } from "./schemas";
import { FareOptions, PassengerForm, type ContactValues, type FieldErrors } from "./PassengerForm";
import { ExtrasForm } from "./ExtrasForm";
import { PaymentForm, type PaymentPayload } from "./PaymentForm";
import { TripSummary, useCountdown } from "./TripSummary";

export interface CheckoutProps {
  offer: Offer;
  fareOptions: Offer[];
  pricing: ExtrasPricing;
  stripePublishableKey: string | null;
  user: { firstName: string; lastName: string; email: string; phone?: string | null } | null;
  searchUrl: string;
}

type Step = 1 | 2 | 3;
const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: "Passengers" },
  { n: 2, label: "Extras" },
  { n: 3, label: "Payment" },
];

interface Persisted {
  step: Step;
  activeOfferId: string;
  passengers: PassengerFormValues[];
  contact: ContactValues;
  extras: ExtrasInput;
}

const PROCESSING_MESSAGES = ["Securing your seats with the airline…", "Confirming your fare…", "Issuing your e-tickets…"];

function StepIndicator({ step }: { step: Step }) {
  return (
    <ol className="flex items-center gap-2 text-sm" aria-label="Checkout progress">
      {STEPS.map((s, i) => {
        const done = s.n < step;
        const current = s.n === step;
        return (
          <li key={s.n} className="flex items-center gap-2">
            <span
              aria-current={current ? "step" : undefined}
              className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold", done ? "bg-success-500 text-white" : current ? "bg-navy-900 text-white" : "border border-slate-300 text-slate-400")}
            >
              {done ? <Check className="h-4 w-4" aria-hidden /> : s.n}
            </span>
            <span className={cn("hidden font-semibold sm:inline", current ? "text-navy-900" : done ? "text-slate-600" : "text-slate-400")}>{s.label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-slate-300 sm:w-10" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

export function Checkout({ offer: initialOffer, fareOptions, pricing, stripePublishableKey, user, searchUrl }: CheckoutProps) {
  const router = useRouter();
  const storageKey = `air1:checkout:${initialOffer.slices.map((s) => s.id).join("-")}`;
  const [step, setStep] = React.useState<Step>(1);
  const [offer, setOffer] = React.useState<Offer>(initialOffer);
  const [options, setOptions] = React.useState<Offer[]>(fareOptions.length ? fareOptions : [initialOffer]);
  const [passengers, setPassengers] = React.useState<PassengerFormValues[]>(() => expectedPassengerTypes(initialOffer).map(emptyPassenger));
  const [contact, setContact] = React.useState<ContactValues>({ email: user?.email ?? "", confirmEmail: user?.email ?? "", phone: user?.phone ?? "", newsletter: false });
  const [extras, setExtras] = React.useState<ExtrasInput>(defaultExtras());
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [restored, setRestored] = React.useState(false);
  const [processing, setProcessing] = React.useState<number | null>(null);
  const [unavailable, setUnavailable] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [priceChanged, setPriceChanged] = React.useState<{ from: number; to: number } | null>(null);
  const { expired } = useCountdown(offer.expiresAt);
  const international = passportRequired(offer, isDomesticUS);
  const summary = summarizePrice(offer, extras);

  // Restore progress after a refresh.
  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const p = JSON.parse(raw) as Persisted;
        if (p.passengers?.length === passengers.length) setPassengers(p.passengers);
        if (p.contact) setContact(p.contact);
        if (p.extras) setExtras(p.extras);
        if (p.step) setStep(p.step);
        const active = options.find((o) => o.id === p.activeOfferId);
        if (active) setOffer(active);
      }
    } catch {}
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!restored) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ step, activeOfferId: offer.id, passengers, contact, extras } satisfies Persisted));
    } catch {}
  }, [restored, storageKey, step, offer.id, passengers, contact, extras]);

  React.useEffect(() => {
    if (step === 1) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Passengers are 1-indexed in error keys: p0.firstName etc.
  function validateStep1(): boolean {
    const errs: FieldErrors = {};
    const departDate = offer.slices[0].departure.slice(0, 10);
    const lastDate = offer.slices[offer.slices.length - 1].arrival.slice(0, 10);
    passengers.forEach((p, i) => {
      const parsed = passengerSchema.safeParse(p);
      if (!parsed.success) for (const issue of parsed.error.issues) errs[`p${i}.${String(issue.path[0])}`] = issue.message;
      if (!p.dateOfBirth || p.dateOfBirth.includes("00")) errs[`p${i}.dateOfBirth`] = "Enter the full date of birth";
      const ageProblem = passengerAgeProblem(p, departDate);
      if (ageProblem && !errs[`p${i}.dateOfBirth`]) errs[`p${i}.dateOfBirth`] = ageProblem;
      if (international) for (const [k, v] of Object.entries(passportProblems(p, lastDate))) errs[`p${i}.${k}`] = v;
    });
    const c = contactSchema.safeParse({ email: contact.email, phone: contact.phone, newsletter: contact.newsletter });
    if (!c.success) for (const issue of c.error.issues) errs[`contact.${String(issue.path[0])}`] = issue.message;
    if (contact.email.trim().toLowerCase() !== contact.confirmEmail.trim().toLowerCase()) errs["contact.confirmEmail"] = "Email addresses don't match";
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      const el = document.getElementById(first.replace(".", "-").replace("firstName", "first").replace("lastName", "last").replace("middleName", "middle").replace("dateOfBirth", "dob-m").replace("passportNumber", "passport").replace("passportCountry", "passport-country").replace("passportExpiry", "pp-dob-m").replace("contact-confirmEmail", "contact-confirm-email"));
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  function selectFare(o: Offer) {
    setOffer(o);
    if (!o.fare.changeable && extras.flexibleTicket) setExtras({ ...extras, flexibleTicket: false });
  }

  async function refreshPrice() {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/bookings/reprice?offerId=${encodeURIComponent(offer.id)}`, { cache: "no-store" });
      if (res.status === 410) {
        setUnavailable(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const fresh = data.offer as Offer;
      if (fresh.price.total !== offer.price.total) setPriceChanged({ from: offer.price.total, to: fresh.price.total });
      setOffer(fresh);
      setOptions((list) => list.map((o) => (o.id === fresh.id ? fresh : { ...o, expiresAt: fresh.expiresAt })));
    } catch {
      setUnavailable(true);
    } finally {
      setRefreshing(false);
    }
  }

  async function pay(payment: PaymentPayload) {
    setProcessing(0);
    const timers = [setTimeout(() => setProcessing(1), 1800), setTimeout(() => setProcessing(2), 3600)];
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: offer.id, passengers, contact: { email: contact.email, phone: contact.phone, newsletter: contact.newsletter }, extras, payment }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 410) {
        setUnavailable(true);
        throw new Error(data.error ?? "This fare is no longer available.");
      }
      if (!res.ok) throw new Error(data.error ?? "We couldn't complete your booking.");
      try {
        sessionStorage.removeItem(storageKey);
      } catch {}
      router.replace(`/book/${encodeURIComponent(initialOffer.id)}/confirmation?ref=${data.reference}`);
    } catch (e) {
      timers.forEach(clearTimeout);
      setProcessing(null);
      throw e;
    }
  }

  if (unavailable) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <h1 className="text-2xl">This fare is no longer available</h1>
        <p className="mt-3 text-slate-600">The airline has withdrawn this price or the seats have sold out. You have not been charged. Search again to see current fares — similar options are usually available.</p>
        <Button href={searchUrl} className="mt-6" size="lg">
          See current fares
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl">{step === 1 ? "Who's traveling?" : step === 2 ? "Add extras" : "Pay securely"}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {step === 1 ? "Enter passenger details exactly as they appear on ID." : step === 2 ? "Bags, seats and protection — add what you need, skip what you don't." : "Review your total and complete the booking."}
          </p>
        </div>
        <StepIndicator step={step} />
      </div>

      {priceChanged && (
        <Alert tone="warning" className="mb-5" title="The price has changed">
          This fare is now {priceChanged.to > priceChanged.from ? "higher" : "lower"}: ${priceChanged.to.toFixed(2)} total (was ${priceChanged.from.toFixed(2)}). The summary has been updated.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_23rem] lg:items-start">
        <div className="min-w-0 space-y-6">
          {step === 1 && (
            <>
              <FareOptions options={options} activeId={offer.id} onSelect={selectFare} />
              <PassengerForm
                offer={offer}
                passengers={passengers}
                contact={contact}
                errors={errors}
                international={international}
                onPassengerChange={(i, patch) => setPassengers((list) => list.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))}
                onContactChange={(patch) => setContact((c) => ({ ...c, ...patch }))}
                onContinue={() => validateStep1() && setStep(2)}
              />
            </>
          )}
          {step === 2 && <ExtrasForm offer={offer} extras={extras} pricing={pricing} onChange={(patch) => setExtras((e) => ({ ...e, ...patch }))} onBack={() => setStep(1)} onContinue={() => setStep(3)} />}
          {step === 3 && <PaymentForm offer={offer} extras={extras} total={summary.total} stripePublishableKey={stripePublishableKey} onBack={() => setStep(2)} onPay={pay} />}
        </div>
        <div className="lg:sticky lg:top-[calc(var(--header-height)+1rem)]">
          <TripSummary offer={offer} extras={extras} />
        </div>
      </div>

      {expired && processing === null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="expired-title">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-float">
            <h2 id="expired-title" className="text-xl font-bold text-navy-900">
              Prices may have changed
            </h2>
            <p className="mt-2 text-sm text-slate-600">Airline fares are held for 20 minutes. Refresh to confirm the current price before you continue — your details are saved.</p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Link href={searchUrl} className="inline-flex h-11 items-center rounded-[var(--radius-field)] px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Back to results
              </Link>
              <Button type="button" onClick={refreshPrice} loading={refreshing} leftIcon={<RefreshCw className="h-4 w-4" aria-hidden />}>
                Refresh price
              </Button>
            </div>
          </div>
        </div>
      )}

      {processing !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/70 p-4" role="alert" aria-live="assertive" aria-busy="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-float">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ocean-50">
              <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-ocean-200 border-t-ocean-600" aria-hidden />
            </span>
            <p className="mt-5 font-semibold text-navy-900">{PROCESSING_MESSAGES[processing]}</p>
            <p className="mt-1 text-xs text-slate-500">Please don&apos;t close this window.</p>
          </div>
        </div>
      )}
    </div>
  );
}
