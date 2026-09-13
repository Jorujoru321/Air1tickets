"use client";

import * as React from "react";
import { MessageCircle, Send } from "lucide-react";
import { track } from "@/lib/analytics/events";
import {
  genericChatText,
  messengerLink,
  whatsappLink,
} from "@/lib/leads/chat-links";
import { activeOfferCode, withOfferLine } from "@/lib/promo/claim";
import { cn } from "@/lib/utils";

/** WhatsApp glyph (brand mark drawn inline so no external asset is needed). */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
    </svg>
  );
}

/**
 * The message to send, with the visitor's ad offer code appended once we are
 * on the client. Starts as the plain text so the server and the first client
 * render agree, then fills in — the href is correct well before anyone taps it.
 */
function useOfferText(text: string): string {
  const [resolved, setResolved] = React.useState(text);
  React.useEffect(() => setResolved(withOfferLine(text)), [text]);
  return resolved;
}

export interface ChatButtonsProps {
  /** Prefilled WhatsApp message. */
  text?: string;
  /** Messenger ref parameter (e.g. a lock reference). */
  messengerRef?: string;
  size?: "sm" | "md" | "lg";
  /** Stack vertically (mobile forms) or inline. */
  layout?: "inline" | "stack";
  showMessenger?: boolean;
  className?: string;
  /** Label override for the WhatsApp button. */
  whatsappLabel?: string;
  onDark?: boolean;
}

/**
 * The two ways travelers talk to an agent. WhatsApp is primary (green, brand
 * recognisable); Messenger is secondary. Both open in a new tab with context.
 */
export function ChatButtons({
  text,
  messengerRef,
  size = "md",
  layout = "inline",
  showMessenger = true,
  className,
  whatsappLabel = "Chat on WhatsApp",
  onDark = false,
}: ChatButtonsProps) {
  const body = useOfferText(text ?? genericChatText());
  const sz =
    size === "sm"
      ? "h-9 px-3 text-sm"
      : size === "lg"
        ? "h-13 px-6 text-base"
        : "h-11 px-5 text-sm";
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-field)] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-500";
  return (
    <div
      className={cn(
        "flex gap-2",
        layout === "stack" ? "flex-col" : "flex-wrap items-center",
        className,
      )}
    >
      <a
        href={whatsappLink(body)}
        target="_blank"
        rel="noopener"
        onClick={() =>
          track("chat_click", {
            placement: "chat_buttons",
            channel: "whatsapp",
            offer_code: activeOfferCode() ?? undefined,
          })
        }
        className={cn(
          base,
          sz,
          "bg-[#25d366] text-[#062b16] hover:bg-[#1fbf5b]",
        )}
      >
        <WhatsAppIcon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />{" "}
        {whatsappLabel}
      </a>
      {showMessenger && (
        <a
          href={messengerLink(messengerRef)}
          target="_blank"
          rel="noopener"
          onClick={() =>
            track("chat_click", {
              placement: "chat_buttons",
              channel: "messenger",
            })
          }
          className={cn(
            base,
            sz,
            onDark
              ? "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20"
              : "border border-slate-300 bg-white text-navy-900 hover:bg-slate-50",
          )}
        >
          <MessageCircle
            className={size === "sm" ? "h-4 w-4" : "h-5 w-5"}
            aria-hidden
          />{" "}
          Messenger
        </a>
      )}
    </div>
  );
}

/** Tiny inline "WhatsApp" text link for dense places like result cards. */
export function WhatsAppTextLink({
  text,
  className,
  label = "Ask on WhatsApp",
}: {
  text: string;
  className?: string;
  label?: string;
}) {
  const body = useOfferText(text);
  return (
    <a
      href={whatsappLink(body)}
      target="_blank"
      rel="noopener"
      onClick={() =>
        track("chat_click", { placement: "result_card", channel: "whatsapp" })
      }
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold text-[#0d7a3f] hover:underline",
        className,
      )}
    >
      <Send className="h-3.5 w-3.5" aria-hidden /> {label}
    </a>
  );
}
