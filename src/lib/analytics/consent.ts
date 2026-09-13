/**
 * Cookie consent.
 *
 * Our cookie policy tells visitors that analytics and advertising cookies are
 * only set with their consent, so the site has to actually honour that. This
 * stores the choice, tells Google Consent Mode about it, and notifies the
 * page so tags can load or stay away.
 *
 * Strictly necessary cookies (session, booking access) are unaffected — they
 * do not need consent and the banner never claims otherwise.
 */
export type ConsentState = "granted" | "denied" | "unknown";

const KEY = "air1:consent";
export const CONSENT_EVENT = "air1:consent-change";

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return "unknown";
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : "unknown";
  } catch {
    // Private mode or blocked storage: treat as no consent given.
    return "unknown";
  }
}

interface ConsentWindow extends Window {
  gtag?: (...args: unknown[]) => void;
}

export function setConsent(state: Exclude<ConsentState, "unknown">): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, state);
  } catch {}
  const value = state === "granted" ? "granted" : "denied";
  try {
    (window as ConsentWindow).gtag?.("consent", "update", {
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
      analytics_storage: value,
    });
  } catch {}
  window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_EVENT, { detail: state }));
}

/**
 * Browsers can send Global Privacy Control, which several US state privacy
 * laws (California's included) require us to treat as an opt-out. When it is
 * set we never ask, and never load advertising tags.
 */
export function globalPrivacyControl(): boolean {
  if (typeof navigator === "undefined") return false;
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}
