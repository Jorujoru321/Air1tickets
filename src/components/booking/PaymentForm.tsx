"use client";

import * as React from "react";
import { ArrowLeft, CreditCard, Lock } from "lucide-react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { ExtrasInput, Offer } from "@/lib/flights/types";
import { cardBrand, luhnValid } from "@/lib/payments/demo";
import { formatMoney } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import Link from "next/link";
import { demoCardSchema } from "./schemas";

export type PaymentPayload = { provider: "stripe"; paymentIntentId: string } | { provider: "demo"; card: { number: string; expMonth: number; expYear: number; cvc: string; name: string; zip: string } };

interface PaymentFormProps {
  offer: Offer;
  extras: ExtrasInput;
  total: number;
  stripePublishableKey: string | null;
  onBack: () => void;
  /** Submits the booking; resolves on success, throws Error(message) on failure. */
  onPay: (payment: PaymentPayload) => Promise<void>;
}

const BRAND_LABEL: Record<string, string> = { visa: "Visa", mastercard: "Mastercard", amex: "American Express", discover: "Discover", unknown: "" };

function formatCardNumber(v: string): string {
  const digits = v.replace(/\D/g, "").slice(0, 19);
  const amex = /^3[47]/.test(digits);
  const groups = amex ? [4, 6, 5] : [4, 4, 4, 4, 3];
  const out: string[] = [];
  let i = 0;
  for (const g of groups) {
    if (i >= digits.length) break;
    out.push(digits.slice(i, i + g));
    i += g;
  }
  return out.join(" ");
}

function TermsRow({ checked, onChange, error }: { checked: boolean; onChange: (c: boolean) => void; error?: string }) {
  return (
    <div>
      <Checkbox
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        id="terms"
        label={
          <>
            I agree to the{" "}
            <Link href="/legal/terms" target="_blank" className="text-ocean-700 underline">
              terms of service
            </Link>
            , the airline&apos;s fare rules and the{" "}
            <Link href="/legal/privacy" target="_blank" className="text-ocean-700 underline">
              privacy policy
            </Link>
            .
          </>
        }
        description="Names must match government ID. Tickets are issued by the airline and are subject to its conditions of carriage."
      />
      {error && (
        <p className="mt-1.5 text-sm text-danger-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function PayButton({ total, loading, disabled }: { total: number; loading: boolean; disabled?: boolean }) {
  return (
    <div className="space-y-2">
      <Button type="submit" size="xl" full loading={loading} disabled={disabled} leftIcon={<Lock className="h-5 w-5" aria-hidden />}>
        Book now · {formatMoney(total, { cents: true })}
      </Button>
      <p className="text-center text-xs text-slate-500">256-bit SSL encrypted · Your card is charged in USD · Free cancellation within 24 hours</p>
    </div>
  );
}

function DemoCardForm({ total, onBack, onPay }: Pick<PaymentFormProps, "total" | "onBack" | "onPay">) {
  const [card, setCard] = React.useState({ number: "", exp: "", cvc: "", name: "", zip: "", country: "US" });
  const [terms, setTerms] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const brand = cardBrand(card.number);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const [mm, yy] = card.exp.split("/").map((s) => s.trim());
    const expMonth = Number(mm);
    const expYear = yy?.length === 2 ? 2000 + Number(yy) : Number(yy);
    const parsed = demoCardSchema.safeParse({ number: card.number, expMonth, expYear, cvc: card.cvc, name: card.name, zip: card.zip });
    if (!parsed.success) for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
    if (!luhnValid(card.number)) errs.number = "Check the card number";
    if (!/^\d{2}\/\d{2,4}$/.test(card.exp)) errs.exp = "Use MM/YY";
    if (!terms) errs.terms = "Please accept the terms to continue";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setServerError(null);
    try {
      await onPay({ provider: "demo", card: { number: card.number.replace(/\s/g, ""), expMonth, expYear, cvc: card.cvc, name: card.name, zip: card.zip } });
    } catch (err) {
      setServerError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Alert tone="info" title="Demo checkout">
        No real charge is made. Use card <span className="font-mono">4242 4242 4242 4242</span>, any future expiry and any CVC. Use <span className="font-mono">4000 0000 0000 0002</span> to simulate a declined card.
      </Alert>
      {serverError && (
        <Alert tone="danger" title="Payment failed">
          {serverError}
        </Alert>
      )}
      <Input label="Name on card" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} error={errors.name} autoComplete="cc-name" id="cc-name" />
      <Input
        label="Card number"
        inputMode="numeric"
        value={card.number}
        onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
        error={errors.number}
        autoComplete="cc-number"
        id="cc-number"
        leftIcon={<CreditCard className="h-5 w-5" aria-hidden />}
        rightSlot={brand !== "unknown" ? <span className="text-xs font-semibold text-slate-500">{BRAND_LABEL[brand]}</span> : undefined}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="Expiration (MM/YY)" inputMode="numeric" placeholder="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value.replace(/[^\d/]/g, "").replace(/^(\d{2})(\d)/, "$1/$2").slice(0, 5) })} error={errors.exp} autoComplete="cc-exp" id="cc-exp" />
        <Input label="Security code" inputMode="numeric" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} error={errors.cvc} autoComplete="cc-csc" id="cc-csc" />
        <Input label="Billing ZIP" inputMode="text" value={card.zip} onChange={(e) => setCard({ ...card, zip: e.target.value.slice(0, 10) })} error={errors.zip} autoComplete="postal-code" id="cc-zip" />
      </div>
      <Select label="Billing country" value={card.country} onChange={(e) => setCard({ ...card, country: e.target.value })} autoComplete="country" id="cc-country">
        <option value="US">United States</option>
        <option value="CA">Canada</option>
        <option value="MX">Mexico</option>
        <option value="GB">United Kingdom</option>
        <option value="OTHER">Other</option>
      </Select>
      <TermsRow checked={terms} onChange={setTerms} error={errors.terms} />
      <PayButton total={total} loading={loading} />
      <Button type="button" variant="ghost" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden />} disabled={loading}>
        Back to extras
      </Button>
    </form>
  );
}

function StripeInner({ total, onBack, onPay }: Pick<PaymentFormProps, "total" | "onBack" | "onPay">) {
  const stripe = useStripe();
  const elements = useElements();
  const [terms, setTerms] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [termsError, setTermsError] = React.useState<string | undefined>();
  const [loading, setLoading] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!terms) return setTermsError("Please accept the terms to continue");
    setTermsError(undefined);
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Check your card details.");
      setLoading(false);
      return;
    }
    const result = await stripe.confirmPayment({ elements, redirect: "if_required", confirmParams: { return_url: window.location.href } });
    if (result.error) {
      setError(result.error.message ?? "Your payment could not be processed.");
      setLoading(false);
      return;
    }
    const intent = result.paymentIntent;
    if (!intent || intent.status !== "succeeded") {
      setError("Your payment is still processing. Please wait a moment and try again.");
      setLoading(false);
      return;
    }
    try {
      await onPay({ provider: "stripe", paymentIntentId: intent.id });
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <Alert tone="danger" title="Payment failed">
          {error}
        </Alert>
      )}
      <PaymentElement options={{ layout: "tabs" }} />
      <TermsRow checked={terms} onChange={setTerms} error={termsError} />
      <PayButton total={total} loading={loading} disabled={!stripe || !elements} />
      <Button type="button" variant="ghost" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden />} disabled={loading}>
        Back to extras
      </Button>
    </form>
  );
}

function StripeCheckout({ offer, extras, total, stripePublishableKey, onBack, onPay }: PaymentFormProps & { stripePublishableKey: string }) {
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const stripePromise = React.useMemo<Promise<Stripe | null>>(() => loadStripe(stripePublishableKey), [stripePublishableKey]);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/payments/intent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ offerId: offer.id, extras }) })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? "Could not start payment");
        return d;
      })
      .then((d) => {
        if (!cancelled) setClientSecret(d.clientSecret);
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, [offer.id, extras]);

  if (error) {
    return (
      <Alert tone="danger" title="Payments unavailable">
        {error}
      </Alert>
    );
  }
  if (!clientSecret) return <p className="text-sm text-slate-500">Preparing secure payment…</p>;
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe", variables: { colorPrimary: "#1a75d8", borderRadius: "10px", fontFamily: "Inter, system-ui, sans-serif" } } }}>
      <StripeInner total={total} onBack={onBack} onPay={onPay} />
    </Elements>
  );
}

export function PaymentForm(props: PaymentFormProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-labelledby="payment-heading">
      <h2 id="payment-heading" className="text-lg font-bold text-navy-900">
        Payment
      </h2>
      <p className="mt-1 mb-5 text-sm text-slate-600">We accept Visa, Mastercard, American Express and Discover. Your card is charged once, in US dollars, when tickets are issued.</p>
      {props.stripePublishableKey ? <StripeCheckout {...props} stripePublishableKey={props.stripePublishableKey} /> : <DemoCardForm total={props.total} onBack={props.onBack} onPay={props.onPay} />}
    </section>
  );
}
