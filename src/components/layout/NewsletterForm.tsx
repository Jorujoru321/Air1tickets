"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";

export function NewsletterForm({ source = "footer" }: { source?: string }) {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = React.useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setState("done");
      setMessage("You're on the list. Watch your inbox for fare drops.");
    } catch (err) {
      setState("error");
      setMessage((err as Error).message);
    }
  }

  if (state === "done") {
    return (
      <p className="text-sm text-white/90" role="status">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="h-11 flex-1 rounded-[var(--radius-field)] border border-white/15 bg-white/10 px-3.5 text-sm text-white placeholder:text-white/50 focus:border-ocean-400 focus:outline-none focus:ring-3 focus:ring-ocean-400/30"
      />
      <Button type="submit" loading={state === "loading"} size="md">
        Get deals
      </Button>
      {state === "error" && (
        <p className="text-sm text-sunrise-300 sm:basis-full" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
