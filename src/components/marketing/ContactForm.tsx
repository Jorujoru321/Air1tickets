"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { isValidReference } from "@/lib/booking/reference";

export const CONTACT_TOPICS: { value: string; label: string }[] = [
  { value: "existing", label: "Existing booking" },
  { value: "new", label: "Help with a new booking" },
  { value: "refund", label: "Refund or cancellation" },
  { value: "website", label: "Website issue" },
  { value: "partnership", label: "Partnership or press" },
  { value: "other", label: "Something else" },
];

export function ContactForm({ initialTopic = "", initialReference = "", initialEmail = "" }: { initialTopic?: string; initialReference?: string; initialEmail?: string }) {
  const [form, setForm] = React.useState({
    name: "",
    email: initialEmail,
    topic: CONTACT_TOPICS.some((t) => t.value === initialTopic) ? initialTopic : "",
    reference: initialReference.toUpperCase(),
    message: "",
    website: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [state, setState] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [serverError, setServerError] = React.useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Please enter your name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = "Enter a valid email address";
    if (!form.topic) errs.topic = "Choose a topic";
    if (form.reference && !isValidReference(form.reference)) errs.reference = "References look like A1K7M2QX";
    if (form.message.trim().length < 10) errs.message = "Tell us a little more (at least 10 characters)";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState("loading");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't send your message.");
      setState("done");
    } catch (err) {
      setServerError((err as Error).message);
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <Alert tone="success" title="Message received">
        Thanks, {form.name.split(" ")[0]}. We&apos;ve emailed a copy to {form.email} and will reply within a few hours — usually much faster. For anything urgent about a flight today, please call us.
      </Alert>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4" aria-label="Contact form">
      {state === "error" && <Alert tone="danger">{serverError}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="contact-name" label="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} autoComplete="name" />
        <Input id="contact-email" label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} autoComplete="email" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select id="contact-topic" label="Topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} error={errors.topic}>
          <option value="">Choose a topic</option>
          {CONTACT_TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <Input id="contact-reference" label="Booking reference (optional)" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) })} error={errors.reference} placeholder="A1K7M2QX" autoComplete="off" className="font-mono uppercase tracking-widest" />
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-navy-900">
          How can we help?
        </label>
        <textarea
          id="contact-message"
          rows={6}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className="w-full rounded-[var(--radius-field)] border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-navy-900 placeholder:text-slate-400 focus:border-ocean-500 focus:outline-none focus:ring-3 focus:ring-ocean-500/20 aria-[invalid=true]:border-danger-500"
          placeholder="Include travel dates, passenger names and what you'd like us to do."
        />
        {errors.message && (
          <p id="contact-message-error" className="mt-1.5 text-sm text-danger-600" role="alert">
            {errors.message}
          </p>
        )}
      </div>
      {/* Honeypot: hidden from users, filled only by bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
      </div>
      <Button type="submit" size="lg" loading={state === "loading"} leftIcon={<Send className="h-4 w-4" aria-hidden />}>
        Send message
      </Button>
    </form>
  );
}
