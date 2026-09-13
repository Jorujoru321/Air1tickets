"use client";

import { WhatsAppIcon } from "@/components/leads/ChatButtons";
import { track } from "@/lib/analytics/events";
import { genericChatText, whatsappLink } from "@/lib/leads/chat-links";

/**
 * Site-wide WhatsApp button, bottom-right. Plain anchor (no JS) so it works
 * before hydration and in every reader mode; hidden from print.
 */
export function FloatingChat() {
  return (
    <a
      href={whatsappLink(genericChatText())}
      target="_blank"
      rel="noopener"
      aria-label="Chat with an Air1 agent on WhatsApp"
      onClick={() => track("chat_click", { placement: "floating_button", channel: "whatsapp" })}
      className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-[#25d366] pl-4 pr-5 text-sm font-bold text-[#062b16] shadow-float transition hover:bg-[#1fbf5b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-500 print:hidden"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden sm:inline">WhatsApp us</span>
    </a>
  );
}
