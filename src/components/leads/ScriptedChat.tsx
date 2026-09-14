"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { WhatsAppIcon } from "@/components/leads/ChatButtons";
import { whatsappLink } from "@/lib/leads/chat-links";
import { claimPopupSlot, releasePopupSlot } from "@/lib/leads/popup-slot";
import { track } from "@/lib/analytics/events";
import { site } from "@/lib/site";

/**
 * The scripted chat: opens itself, asks the two questions an agent would ask
 * anyway (where, and roughly when), then hands the whole thing to WhatsApp
 * with the answers already typed out.
 *
 * It runs entirely in the browser, so it works on the static export where
 * there is no server to talk to. Nothing is stored and nothing is sent until
 * the visitor taps through to WhatsApp themselves.
 *
 * On honesty: this is a script, and it says so on the header and in its first
 * message. It is not given a human name or a stock photo of a person, and it
 * never claims someone is "checking availability" while a timer runs. Those
 * patterns are what the FTC pursues as deceptive, travelers have learned to
 * discount them, and the handoff converts without them.
 *
 * Behaviour: opens once per visitor per SUPPRESS_DAYS, only after the visitor
 * has been on the page a moment, never on pages that are already a pitch, and
 * never when the welcome offer got there first. Dismissible by button and
 * Escape, focus moves into it on open and returns to the launcher on close.
 */

const SEEN_KEY = "air1.chat.v1";
const SUPPRESS_DAYS = 5;
/** Time on the page before it opens itself. */
const AUTO_OPEN_MS = 5000;
/** How long the typing dots show before each scripted line. */
const TYPING_MS = 900;
const SLOT = "scripted-chat";

/** Pages that are already a full pitch — opening over them is noise. */
const SUPPRESSED_PATHS = [
  "/offer",
  "/contact",
  "/book",
  "/booking",
  "/account",
  "/admin",
];

type Msg = { id: number; from: "bot" | "user"; text: string };

function recentlySeen(): boolean {
  try {
    const at = Number(window.localStorage.getItem(SEEN_KEY));
    if (!Number.isFinite(at) || !at) return false;
    return Date.now() - at < SUPPRESS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    // Storage blocked: don't nag on every page view.
    return true;
  }
}

function markSeen(): void {
  try {
    window.localStorage.setItem(SEEN_KEY, String(Date.now()));
  } catch {
    /* nothing we can do, and nothing that should break the page */
  }
}

const WHEN_CHOICES = [
  "In the next few days",
  "Later this month",
  "Just planning ahead",
];

export function ScriptedChat() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [typing, setTyping] = React.useState(false);
  /** 0 greet · 1 asking route · 2 asking when · 3 ready to hand off */
  const [step, setStep] = React.useState(0);
  const [route, setRoute] = React.useState("");
  const [when, setWhen] = React.useState("");
  const [draft, setDraft] = React.useState("");

  const panelRef = React.useRef<HTMLDivElement>(null);
  const launcherRef = React.useRef<HTMLAnchorElement>(null);
  const logRef = React.useRef<HTMLDivElement>(null);
  const nextId = React.useRef(0);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const suppressed = SUPPRESSED_PATHS.some((p) => pathname?.startsWith(p));

  const after = React.useCallback((ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }, []);

  const say = React.useCallback(
    (text: string, from: Msg["from"] = "bot") =>
      setMsgs((m) => [...m, { id: nextId.current++, from, text }]),
    [],
  );

  /** A bot line, preceded by the typing dots so it does not all land at once. */
  const botSays = React.useCallback(
    (text: string, delay = TYPING_MS) => {
      setTyping(true);
      after(delay, () => {
        setTyping(false);
        say(text);
      });
    },
    [after, say],
  );

  // Clean up every pending timer on unmount.
  React.useEffect(() => {
    const list = timers.current;
    return () => {
      list.forEach(clearTimeout);
      releasePopupSlot(SLOT);
    };
  }, []);

  const start = React.useCallback(() => {
    setOpen(true);
    markSeen();
    if (msgs.length === 0) {
      botSays(`Hi! You're through to ${site.name}.`, 400);
      after(1500, () =>
        botSays(
          "I can pass your trip to one of our agents, who'll price it for you on WhatsApp. Where are you flying?",
          TYPING_MS,
        ),
      );
      after(2600, () => setStep(1));
    }
  }, [after, botSays, msgs.length]);

  // Open itself once the visitor has actually settled on the page.
  React.useEffect(() => {
    if (suppressed || open || recentlySeen()) return;
    const t = setTimeout(() => {
      if (!claimPopupSlot(SLOT)) return;
      track("chat_click", { placement: "scripted_chat_auto", channel: "whatsapp" });
      start();
    }, AUTO_OPEN_MS);
    return () => clearTimeout(t);
  }, [suppressed, open, start]);

  // Escape closes; focus moves in on open and back to the launcher on close.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, step]);

  // Keep the newest message in view.
  React.useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, step]);

  function answerRoute(value: string) {
    const text = value.trim();
    if (!text) return;
    setRoute(text);
    setDraft("");
    say(text, "user");
    setStep(0);
    botSays("Got it. Roughly when do you want to travel?");
    after(TYPING_MS + 200, () => setStep(2));
  }

  function answerWhen(value: string) {
    setWhen(value);
    say(value, "user");
    setStep(0);
    botSays(
      "Perfect. Tap below and it opens WhatsApp with your trip already written out. An agent picks it up from there.",
    );
    after(TYPING_MS + 200, () => setStep(3));
  }

  function close() {
    setOpen(false);
    markSeen();
    releasePopupSlot(SLOT);
    launcherRef.current?.focus();
  }

  /** Everything the visitor told us, formatted for the agent's first glance. */
  const handoffText = React.useMemo(() => {
    const lines = ["Hi! I'd like a price for a flight."];
    if (route) lines.push(`Trip: ${route}`);
    if (when) lines.push(`When: ${when}`);
    lines.push("(Sent from the website chat)");
    return lines.join("\n");
  }, [route, when]);

  const href = whatsappLink(handoffText);

  return (
    <>
      {/* Launcher. A real WhatsApp link, so it still works with no JS; once
          hydrated it opens the chat instead. */}
      <a
        ref={launcherRef}
        href={href}
        target="_blank"
        rel="noopener"
        aria-label={`Chat with ${site.name}`}
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          claimPopupSlot(SLOT);
          track("chat_click", { placement: "scripted_chat_launcher", channel: "whatsapp" });
          open ? close() : start();
        }}
        className={`fixed bottom-5 right-5 z-40 hidden h-14 items-center gap-2 rounded-full bg-[#25d366] pl-4 pr-5 text-sm font-bold text-[#062b16] shadow-float transition hover:bg-[#1fbf5b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-500 print:hidden ${
          open ? "sm:hidden" : "sm:flex"
        }`}
      >
        <WhatsAppIcon className="h-6 w-6" />
        <span>WhatsApp us</span>
      </a>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label={`Chat with ${site.name}`}
          className="fixed bottom-0 right-0 z-50 flex h-[min(34rem,100dvh)] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-float motion-safe:animate-in motion-safe:slide-in-from-bottom-4 sm:bottom-5 sm:right-5 sm:h-[32rem] sm:w-[22rem] sm:rounded-2xl print:hidden"
        >
          <header className="flex items-center gap-3 bg-gradient-to-br from-ocean-900 to-ocean-700 px-4 py-3.5 text-white">
            <span
              aria-hidden
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#25d366] text-[#062b16]"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{site.name}</span>
              {/* Says what it is. No invented person, no fake "online" dot. */}
              <span className="block text-xs text-ocean-200">
                Automated · connects you to an agent
              </span>
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close chat"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ocean-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {/* The actual pitch, and it is true: agent-negotiated fares are not
              published to public search engines. No countdown, no invented
              "someone is checking" — just the reason to use an agent. */}
          <p className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-900">
            Agent-only fares you won&apos;t find on public search
          </p>

          <div
            ref={logRef}
            aria-live="polite"
            className="flex-1 space-y-2 overflow-y-auto bg-ocean-50/40 px-4 py-4"
          >
            {msgs.map((m) => (
              <p
                key={m.id}
                className={
                  m.from === "bot"
                    ? "max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm text-ocean-900 shadow-card"
                    : "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-ocean-900 px-3 py-2 text-sm text-white"
                }
              >
                {m.text}
              </p>
            ))}

            {typing && (
              <p
                className="flex w-14 gap-1 rounded-2xl rounded-tl-sm bg-white px-3 py-3 shadow-card"
                aria-label="Typing"
              >
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 rounded-full bg-ocean-400 motion-safe:animate-bounce"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </p>
            )}
          </div>

          <div className="border-t border-ocean-100 bg-white p-3">
            {step === 1 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  answerRoute(draft);
                }}
                className="flex gap-2"
              >
                <input
                  data-autofocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="e.g. Atlanta to London"
                  aria-label="Where are you flying?"
                  className="min-w-0 flex-1 rounded-full border border-ocean-200 px-4 py-2 text-sm text-ocean-900 outline-none placeholder:text-ocean-400 focus-visible:border-ocean-500"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="rounded-full bg-ocean-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-ocean-800 disabled:opacity-40"
                >
                  Send
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="flex flex-wrap gap-2">
                {WHEN_CHOICES.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    {...(i === 0 ? { "data-autofocus": true } : {})}
                    onClick={() => answerWhen(c)}
                    className="rounded-full border border-ocean-200 px-3 py-2 text-sm font-semibold text-ocean-900 transition hover:border-ocean-500 hover:bg-ocean-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-500"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <a
                data-autofocus
                href={href}
                target="_blank"
                rel="noopener"
                onClick={() => {
                  markSeen();
                  track("request_sent", {
                    kind: "flight",
                    placement: "scripted_chat",
                    channel: "whatsapp",
                  });
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 text-sm font-bold text-[#062b16] transition hover:bg-[#1fbf5b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-500"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Continue on WhatsApp
              </a>
            )}

            {step === 3 && (
              <>
                <a
                  href={`tel:${site.supportPhone.replace(/[^\d+]/g, "")}`}
                  onClick={() =>
                    track("phone_click", { placement: "scripted_chat" })
                  }
                  className="mt-2 flex h-11 items-center justify-center rounded-full border border-ocean-200 px-5 text-sm font-bold text-ocean-900 transition hover:border-ocean-500 hover:bg-ocean-50"
                >
                  Or call {site.supportPhone}
                </a>
                <p className="pt-2 text-center text-xs text-ocean-500">
                  Free quote. No card, no account.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
