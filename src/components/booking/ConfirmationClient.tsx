"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Polls a pending booking until it is confirmed or failed, then re-renders the server page. */
export function PendingPoller({ reference }: { reference: string }) {
  const router = useRouter();
  React.useEffect(() => {
    let attempts = 0;
    const id = setInterval(async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/bookings/${reference}/status`, { cache: "no-store" });
        const data = await res.json();
        if (data.status && data.status !== "pending") {
          clearInterval(id);
          router.refresh();
        }
      } catch {}
      if (attempts >= 20) clearInterval(id);
    }, 3000);
    return () => clearInterval(id);
  }, [reference, router]);
  return (
    <p className="text-sm text-slate-600" role="status" aria-live="polite">
      We&apos;re waiting for the airline to confirm your tickets. This page updates automatically.
    </p>
  );
}

export function PrintButton() {
  return (
    <Button type="button" variant="outline" onClick={() => window.print()} leftIcon={<Printer className="h-4 w-4" aria-hidden />} className="print:hidden">
      Print
    </Button>
  );
}
