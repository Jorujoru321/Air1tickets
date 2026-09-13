/**
 * Conversion tracking.
 *
 * The business runs on one action: a visitor handing their trip to an agent on
 * WhatsApp. Everything here exists so that action is measurable, because you
 * cannot buy traffic profitably without knowing which traffic converts.
 *
 * Events go to whichever platforms are configured (GA4, Meta Pixel) and are
 * silently dropped when none are, so nothing breaks in development.
 */

export type AnalyticsEvent =
  /** A search form was submitted and the visitor was sent to WhatsApp. This is the conversion. */
  | "request_sent"
  /** A chat button was clicked (floating button, header, CTA) rather than a search form. */
  | "chat_click"
  /** The phone number was tapped. */
  | "phone_click"
  /** A fare lock form was completed. */
  | "lock_completed"
  /** Newsletter signup. */
  | "newsletter_signup"
  /** A search form failed validation — high counts mean the form is confusing. */
  | "search_error";

export interface EventParams {
  /** "flight" | "hotel" | "activity" — what was requested. */
  kind?: string;
  /** Where on the site it happened, e.g. "home_hero", "floating_button". */
  placement?: string;
  origin?: string;
  destination?: string;
  travelers?: number;
  /** Approximate trip value, used for value-based bidding once you run ads. */
  value?: number;
  currency?: string;
  [key: string]: unknown;
}

type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;

interface TrackingWindow extends Window {
  gtag?: Gtag;
  fbq?: Fbq;
  dataLayer?: unknown[];
}

/**
 * Platform-specific names for the same action. Meta only recognises a fixed
 * set of standard events; "Lead" is the right one for a contact hand-off.
 */
const META_EVENTS: Partial<Record<AnalyticsEvent, string>> = {
  request_sent: "Lead",
  chat_click: "Contact",
  phone_click: "Contact",
  lock_completed: "Lead",
  newsletter_signup: "Subscribe",
};

export function track(event: AnalyticsEvent, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  const w = window as TrackingWindow;
  const payload = { currency: "USD", ...params };

  try {
    w.gtag?.("event", event, payload);
  } catch {}

  try {
    const metaName = META_EVENTS[event];
    if (metaName) w.fbq?.("track", metaName, { content_category: params.kind, value: params.value, currency: payload.currency });
  } catch {}

  if (process.env.NODE_ENV === "development") console.debug("[analytics]", event, payload);
}
