"use client";

import { PhoneCall } from "lucide-react";
import { WhatsAppIcon } from "@/components/leads/ChatButtons";
import { whatsappLink, genericChatText } from "@/lib/leads/chat-links";
import { withOfferLine } from "@/lib/promo/claim";
import { track } from "@/lib/analytics/events";
import { site } from "@/lib/site";

/**
 * Persistent call / message bar at the bottom of every phone screen.
 *
 * Most traffic to a site like this is mobile, and a bar that is always there
 * converts better than a single floating circle — both actions are visible at
 * once, and neither needs the visitor to scroll back to a form. The floating
 * button takes over on desktop, so the two never appear together.
 *
 * The safe-area padding matters on iPhones: without it the buttons sit under
 * the home indicator and the bottom few pixels stop responding to taps.
 */
export function StickyMobileCta() {
  const tel = `tel:${site.supportPhone.replace(/[^\d+]/g, "")}`;
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 sm:hidden print:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex gap-2 px-3 py-2.5">
        <a
          href={tel}
          onClick={() => track("phone_click", { placement: "sticky_mobile" })}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-field)] bg-navy-950 text-sm font-bold text-white active:bg-navy-900"
        >
          <PhoneCall className="h-4.5 w-4.5 text-sunrise-400" aria-hidden />
          Call now
        </a>
        <a
          href={whatsappLink(withOfferLine(genericChatText()))}
          target="_blank"
          rel="noopener"
          onClick={() =>
            track("chat_click", {
              placement: "sticky_mobile",
              channel: "whatsapp",
            })
          }
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-field)] bg-[#25d366] text-sm font-bold text-[#062b16] active:bg-[#1fbf5b]"
        >
          <WhatsAppIcon className="h-4.5 w-4.5" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
