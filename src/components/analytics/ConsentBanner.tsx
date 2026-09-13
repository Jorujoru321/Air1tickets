"use client";

import * as React from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { globalPrivacyControl, readConsent, setConsent } from "@/lib/analytics/consent";

const HAS_TAGS = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID);

/**
 * Consent prompt for analytics and advertising cookies.
 *
 * Only appears when there is actually something to consent to, and never when
 * the browser sends Global Privacy Control — that signal is an opt-out we have
 * to honour, so asking again would be pestering someone who already answered.
 */
export function ConsentBanner() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!HAS_TAGS) return;
    if (globalPrivacyControl()) {
      setConsent("denied");
      return;
    }
    if (readConsent() === "unknown") setVisible(true);
  }, []);

  if (!visible) return null;

  function choose(state: "granted" | "denied") {
    setConsent(state);
    setVisible(false);
  }

  return (
    <div role="dialog" aria-modal="false" aria-labelledby="consent-title" className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white p-4 shadow-float sm:inset-x-4 sm:bottom-4 sm:max-w-lg sm:rounded-2xl sm:border print:hidden">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
          <Cookie className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p id="consent-title" className="font-semibold text-navy-900">
            Cookies
          </p>
          <p className="mt-1 text-sm text-slate-600">
            We use cookies that keep the site working, and — only if you agree — cookies that tell us which pages people use and whether our ads are worth running.{" "}
            <Link href="/legal/cookies" className="font-medium text-ocean-700 underline">
              Cookie policy
            </Link>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => choose("granted")}>
              Accept
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => choose("denied")}>
              Only essential
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
