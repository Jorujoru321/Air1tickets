import { whatsappLink } from "@/lib/leads/chat-links";
import { track } from "@/lib/analytics/events";

/**
 * Send a traveler into WhatsApp with their request already typed out, and
 * record the request on our side first so nothing is lost if they never hit
 * send. Called from search forms on submit.
 */
export function openWhatsAppRequest(text: string, meta?: Record<string, unknown>): void {
  const href = whatsappLink(text);
  // The conversion. Fire before navigating so the beacon has a chance to leave.
  track("request_sent", {
    kind: String(meta?.kind ?? "flight"),
    origin: meta?.origin as string | undefined,
    destination: meta?.destination as string | undefined,
    travelers: meta?.travelers as number | undefined,
    placement: String(meta?.source ?? "search_form"),
  });
  // Fire-and-forget: never let logging delay or block the hand-off.
  try {
    const body = JSON.stringify({ text, ...meta });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/requests", new Blob([body], { type: "application/json" }));
    else void fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  } catch {}
  // Same-tab navigation is the most reliable: popup blockers eat window.open
  // on mobile Safari, and WhatsApp's web handler takes over from here.
  window.location.href = href;
}
