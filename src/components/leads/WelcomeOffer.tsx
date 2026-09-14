"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { BadgeCheck, Clock3, PhoneCall, Plane, Tag, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/leads/ChatButtons";
import { whatsappLink } from "@/lib/leads/chat-links";
import { claimPopupSlot } from "@/lib/leads/popup-slot";
import { withOfferLine, useOffer } from "@/lib/promo/claim";
import { formatCountdown, promo } from "@/lib/promo/offer";
import { track } from "@/lib/analytics/events";
import { isStaticPreview, site } from "@/lib/site";

/**
 * The entry offer.
 *
 * Opens once per visitor on the first page they spend real time on, and asks
 * for the one action that converts best for a last-minute agency: a phone call
 * or a WhatsApp message. Email is offered third, for people whose trip is not
 * booked yet.
 *
 * What creates the urgency here is true, which is the only kind that keeps
 * working: last-minute fares genuinely move day to day, an ad code genuinely
 * expires on a timestamp written once, and the reply time is a promise the
 * business has to keep. There is no fabricated viewer count, no invented seat
 * counter and no timer that restarts on refresh — those are the specific
 * practices the FTC and state AGs pursue as dark patterns, and travelers have
 * learned to discount them anyway.
 *
 * It is dismissible by button, backdrop, and Escape, it traps focus while open,
 * and it stays shut for SUPPRESS_DAYS afterwards.
 */

const SEEN_KEY = "air1.welcome.v1";
const SUPPRESS_DAYS = 5;
/** Time on page before it opens, if nothing else triggers it first. */
const DELAY_MS = 7000;
/** Routes that are already a full pitch — a popup on top of them is noise. */
const SUPPRESSED_PATHS = [
  "/offer",
  "/contact",
  "/book",
  "/booking",
  "/account",
  "/admin",
];

function recentlySeen(): boolean {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < SUPPRESS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    // Storage blocked: show it once this page view rather than on every render.
    return true;
  }
}

function markSeen(): void {
  try {
    window.localStorage.setItem(SEEN_KEY, String(Date.now()));
  } catch {}
}

const BENEFITS = [
  {
    icon: Tag,
    title: "Fares that aren't published",
    text: "Consolidator and unsold-seat inventory public search can't display.",
  },
  {
    icon: Clock3,
    title: `A price in about ${site.priceLock.responseMinutes} minutes`,
    text: "From a person, with the cheaper dates and nearby airports you'd miss.",
  },
  {
    icon: BadgeCheck,
    title: "Free to ask, free to walk away",
    text: "No account, no card. You pay only if you take the deal.",
  },
];

export function WelcomeOffer() {
  const pathname = usePathname();
  const { offer, remainingMs, expired } = useOffer();
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [emailState, setEmailState] = React.useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [emailMessage, setEmailMessage] = React.useState("");
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const restoreTo = React.useRef<HTMLElement | null>(null);

  const suppressed = SUPPRESSED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  // Open on whichever comes first: dwell time, leaving toward the tab bar, or
  // reading far enough down to show intent.
  React.useEffect(() => {
    if (suppressed || recentlySeen()) return;
    let done = false;
    const show = () => {
      if (done) return;
      // The scripted chat opens earlier than this. Whichever got there first
      // owns the screen; two of these at once is intolerable.
      if (!claimPopupSlot("welcome-offer")) return;
      done = true;
      markSeen();
      setOpen(true);
    };
    const timer = window.setTimeout(show, DELAY_MS);
    const onExit = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.4) show();
    };
    document.addEventListener("mouseout", onExit);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseout", onExit);
      window.removeEventListener("scroll", onScroll);
    };
  }, [suppressed]);

  React.useEffect(() => {
    if (!open) return;
    track("promo_shown", {
      placement: "welcome_modal",
      offer_code: offer?.code,
      source: offer?.source,
    });
    restoreTo.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      // Focus trap: a modal that lets you tab into the page behind it is not one.
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      restoreTo.current?.focus?.();
    };
  }, [open, offer]);

  if (!open) return null;

  const tel = `tel:${site.supportPhone.replace(/[^\d+]/g, "")}`;
  const waText = withOfferLine(
    `Hi ${site.name}! I'm looking for a last-minute deal. My trip: `,
  );
  const countdown = offer && !expired ? formatCountdown(remainingMs) : null;

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setEmailState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "welcome_modal" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setEmailState("done");
      setEmailMessage("Done — we'll send fare drops as we see them.");
      track("newsletter_signup", { placement: "welcome_modal" });
    } catch (err) {
      setEmailState("error");
      setEmailMessage((err as Error).message);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4 print:hidden">
      <button
        type="button"
        aria-label="Close offer"
        tabIndex={-1}
        onClick={() => setOpen(false)}
        className="absolute inset-0 cursor-default bg-navy-950/70 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="relative w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-float sm:rounded-2xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        <div className="bg-navy-950 px-6 pb-6 pt-7 text-white">
          <p className="inline-flex items-center gap-2 rounded-full bg-sunrise-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sunrise-200 ring-1 ring-sunrise-300/30">
            <Plane className="h-3.5 w-3.5" aria-hidden /> Last-minute deals
          </p>
          <h2
            id="welcome-title"
            className="mt-3 font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl"
          >
            Flying soon? Call us before you book.
          </h2>
          <p className="mt-2 text-white/80">
            Last-minute fares move every day, and the lowest ones rarely reach
            public search. Tell us the trip and an agent prices it against what
            you&apos;re seeing — anywhere in the US, Canada or beyond.
          </p>
          {offer && !expired && countdown && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm">
              <Tag className="h-4 w-4 text-sunrise-300" aria-hidden />
              <span>
                Your code{" "}
                <span className="font-mono text-xs font-bold">
                  {offer.code}
                </span>{" "}
                — up to {promo.discount}% off
              </span>
              <span className="tabular-nums text-sunrise-200">
                <span className="sr-only">Time remaining: </span>
                {countdown}
              </span>
            </p>
          )}
        </div>

        <div className="px-6 py-5">
          <ul className="space-y-3">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ocean-50 text-ocean-600">
                  <b.icon className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-bold text-navy-900">
                    {b.title}
                  </span>
                  <span className="block text-sm leading-relaxed text-slate-600">
                    {b.text}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-col gap-2.5">
            <a
              href={tel}
              onClick={() =>
                track("phone_click", {
                  placement: "welcome_modal",
                  offer_code: offer?.code,
                })
              }
              className="flex h-14 items-center justify-center gap-2.5 rounded-[var(--radius-field)] bg-navy-950 text-base font-bold text-white transition hover:bg-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-500"
            >
              <PhoneCall className="h-5 w-5 text-sunrise-400" aria-hidden />
              Call {site.supportPhone}
            </a>
            <a
              href={whatsappLink(waText)}
              target="_blank"
              rel="noopener"
              onClick={() =>
                track("chat_click", {
                  placement: "welcome_modal",
                  channel: "whatsapp",
                  offer_code: offer?.code,
                })
              }
              className="flex h-13 items-center justify-center gap-2.5 rounded-[var(--radius-field)] bg-[#25d366] text-sm font-bold text-[#062b16] transition hover:bg-[#1fbf5b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-500"
            >
              <WhatsAppIcon className="h-5 w-5" /> Message us on WhatsApp
            </a>
          </div>

          {/* Third option, for people whose trip is not booked yet. Hidden in the
              static preview, which has no API route to post to. */}
          {!isStaticPreview && (
            <div className="mt-5 border-t border-slate-200 pt-4">
              {emailState === "done" ? (
                <p
                  className="text-sm font-semibold text-success-700"
                  role="status"
                >
                  {emailMessage}
                </p>
              ) : (
                <form onSubmit={subscribe}>
                  <label
                    htmlFor="welcome-email"
                    className="block text-sm text-slate-600"
                  >
                    Not travelling yet? We&apos;ll send fare drops instead.
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="welcome-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-11 flex-1 rounded-[var(--radius-field)] border border-slate-300 px-3.5 text-sm focus:border-ocean-500 focus:outline-none focus:ring-3 focus:ring-ocean-500/20"
                    />
                    <button
                      type="submit"
                      disabled={emailState === "loading"}
                      className="h-11 shrink-0 rounded-[var(--radius-field)] border border-slate-300 px-4 text-sm font-semibold text-navy-900 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      {emailState === "loading" ? "Sending…" : "Send them"}
                    </button>
                  </div>
                  {emailState === "error" && (
                    <p className="mt-2 text-sm text-danger-600" role="alert">
                      {emailMessage}
                    </p>
                  )}
                </form>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 w-full text-center text-xs text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
          >
            No thanks, I&apos;ll keep looking
          </button>
        </div>
      </div>
    </div>
  );
}
