import { whatsappLink } from "@/lib/leads/chat-links";
import { track } from "@/lib/analytics/events";
import {
  activeOfferCode,
  activeOfferSource,
  withOfferLine,
} from "@/lib/promo/claim";

/**
 * Send a traveler into WhatsApp with their request already typed out, and
 * record the request on our side first so nothing is lost if they never hit
 * send. Called from search forms on submit.
 */
export function openWhatsAppRequest(
  text: string,
  meta?: Record<string, unknown>,
): void {
  // An ad-referred visitor carries their code into the thread, so the agent
  // quoting the trip honours what the ad promised.
  const body = withOfferLine(text);
  const offerCode = activeOfferCode();
  const href = whatsappLink(body);
  // The conversion. Fire before navigating so the beacon has a chance to leave.
  track("request_sent", {
    kind: String(meta?.kind ?? "flight"),
    origin: meta?.origin as string | undefined,
    destination: meta?.destination as string | undefined,
    travelers: meta?.travelers as number | undefined,
    placement: String(meta?.source ?? "search_form"),
    offer_code: offerCode ?? undefined,
  });
  if (offerCode) {
    track("promo_applied", {
      kind: String(meta?.kind ?? "flight"),
      placement: String(meta?.source ?? "search_form"),
      offer_code: offerCode,
      source: activeOfferSource() ?? undefined,
    });
  }
  // Fire-and-forget: never let logging delay or block the hand-off.
  try {
    const payload = JSON.stringify({ text: body, offerCode, ...meta });
    if (navigator.sendBeacon)
      navigator.sendBeacon(
        "/api/requests",
        new Blob([payload], { type: "application/json" }),
      );
    else
      void fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
  } catch {}
  // Same-tab navigation is the most reliable: popup blockers eat window.open
  // on mobile Safari, and WhatsApp's web handler takes over from here.
  window.location.href = href;
}
