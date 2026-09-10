"use client";

import * as React from "react";
import { CheckCircle2, Lock, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { WhatsAppIcon } from "@/components/leads/ChatButtons";
import { cn, formatDateLong, formatMoney } from "@/lib/utils";

const CHANNELS = [
  { value: "whatsapp", label: "WhatsApp", hint: "Fastest", icon: WhatsAppIcon },
  { value: "messenger", label: "Messenger", hint: "Facebook", icon: MessageCircle },
  { value: "call", label: "Phone call", hint: "We call you", icon: Phone },
  { value: "sms", label: "Text (SMS)", hint: "", icon: MessageCircle },
] as const;
type Channel = (typeof CHANNELS)[number]["value"];

interface LockResult {
  reference: string;
  lockedPrice: number;
  expiresAt: string;
  responseMinutes: number;
  whatsapp: string;
  messenger: string;
}

export interface LockFareFormProps {
  offerId: string;
  /** Per-traveler price shown on the results page. */
  price: number;
  lockHours: number;
  source?: string;
  initial?: { name?: string; email?: string; phone?: string };
  /** wa.me link with the fare prefilled, for the "chat instead" shortcut. */
  whatsappHref: string;
}

/**
 * The conversion step of the lead model: 30 seconds, no card. On success it
 * shows the lock reference and hands the traveler straight into WhatsApp with
 * the reference prefilled, so the agent has full context on the first message.
 */
export function LockFareForm({ offerId, price, lockHours, source = "results", initial, whatsappHref }: LockFareFormProps) {
  const [form, setForm] = React.useState({ name: initial?.name ?? "", email: initial?.email ?? "", phone: initial?.phone ?? "", channel: "whatsapp" as Channel, notes: "", company: "" });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [state, setState] = React.useState<"idle" | "loading" | "error">("idle");
  const [serverError, setServerError] = React.useState("");
  const [result, setResult] = React.useState<LockResult | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "Please enter your name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = "Enter a valid email address";
    if (!/^[+\d][\d\s().-]{6,}$/.test(form.phone.trim())) errs.phone = "Enter a phone number we can reach you on";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState("loading");
    try {
      const res = await fetch("/api/price-locks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, offerId, source }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't lock this fare. Please try again or message us on WhatsApp.");
      setResult(data as LockResult);
      setState("idle");
    } catch (err) {
      setServerError((err as Error).message);
      setState("error");
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-success-200 bg-success-50 p-6" role="status" aria-live="polite">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success-700" aria-hidden />
          <div>
            <h2 className="text-xl font-bold text-navy-900">Your fare is locked</h2>
            <p className="mt-1 text-sm text-slate-700">
              Reference <span className="font-mono text-base font-bold tracking-wider text-navy-900">{result.reference}</span>. We&apos;re holding{" "}
              <span className="font-semibold">{formatMoney(result.lockedPrice)}</span> per traveler until {formatDateLong(result.expiresAt)}.
            </p>
            <p className="mt-2 text-sm text-slate-700">
              An agent will message you on {CHANNELS.find((c) => c.value === form.channel)?.label ?? "WhatsApp"} within about {result.responseMinutes} minutes during business hours. Closer to your departure we re-check every airline and send your final last-minute deal — you only pay when you accept it.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={result.whatsapp} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-field)] bg-[#25d366] px-5 text-sm font-semibold text-[#062b16] hover:bg-[#1fbf5b]">
                <WhatsAppIcon className="h-5 w-5" /> Continue on WhatsApp
              </a>
              <a href={result.messenger} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-field)] border border-slate-300 bg-white px-5 text-sm font-semibold text-navy-900 hover:bg-slate-50">
                <MessageCircle className="h-5 w-5" aria-hidden /> Messenger
              </a>
            </div>
            <p className="mt-3 text-xs text-slate-500">We&apos;ve emailed a copy to {form.email}. Keep your reference handy — it lets any agent pull up your locked fare instantly.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5" aria-label="Lock this fare">
      {state === "error" && <Alert tone="danger">{serverError}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="lock-name" label="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} autoComplete="name" />
        <Input id="lock-phone" label="Phone / WhatsApp number" type="tel" inputMode="tel" placeholder="+1 (555) 123-4567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} autoComplete="tel" />
      </div>
      <Input id="lock-email" label="Email" type="email" inputMode="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} autoComplete="email" hint="For your lock confirmation and final quote." />

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-navy-900">How should we reach you?</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CHANNELS.map((c) => {
            const active = form.channel === c.value;
            return (
              <label key={c.value} className={cn("flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-3 py-3 text-center text-sm transition", active ? "border-ocean-500 bg-ocean-50 text-navy-900 ring-2 ring-ocean-500/20" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400")}>
                <input type="radio" name="channel" value={c.value} checked={active} onChange={() => setForm({ ...form, channel: c.value })} className="sr-only" />
                <c.icon className={cn("h-5 w-5", c.value === "whatsapp" ? "text-[#0d7a3f]" : "text-ocean-600")} />
                <span className="font-semibold">{c.label}</span>
                {c.hint && <span className="text-[11px] text-slate-600">{c.hint}</span>}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="lock-notes" className="mb-1.5 block text-sm font-medium text-navy-900">
          Anything we should know? <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          id="lock-notes"
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Flexible dates, nearby airports, a budget, traveling with kids…"
          className="w-full rounded-[var(--radius-field)] border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-navy-900 placeholder:text-slate-400 focus:border-ocean-500 focus:outline-none focus:ring-3 focus:ring-ocean-500/20"
        />
      </div>

      {/* Honeypot: hidden from people, filled only by bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="lock-company">Company</label>
        <input id="lock-company" type="text" tabIndex={-1} autoComplete="off" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      </div>

      <Button type="submit" size="xl" full loading={state === "loading"} leftIcon={<Lock className="h-5 w-5" aria-hidden />}>
        Lock {formatMoney(price)} for {lockHours} hours — free
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> No card, no commitment. You pay only when you accept your final deal.
      </p>
      <p className="text-center text-sm text-slate-600">
        Prefer to chat right away?{" "}
        <a href={whatsappHref} target="_blank" rel="noopener" className="font-semibold text-[#0d7a3f] hover:underline">
          Message us on WhatsApp
        </a>
      </p>
    </form>
  );
}
