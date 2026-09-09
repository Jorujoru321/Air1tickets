"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Mail, Printer, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ResendButton({ reference }: { reference: string }) {
  const [state, setState] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = React.useState("");
  return (
    <div>
      <Button
        type="button"
        variant="outline"
        loading={state === "loading"}
        leftIcon={<Mail className="h-4 w-4" aria-hidden />}
        onClick={async () => {
          setState("loading");
          const res = await fetch(`/api/bookings/${reference}/resend`, { method: "POST" });
          const data = await res.json().catch(() => ({}));
          if (res.ok) {
            setState("done");
            setMsg(`Sent to ${data.email}`);
          } else {
            setState("error");
            setMsg(data.error ?? "Could not resend right now.");
          }
        }}
      >
        Resend confirmation
      </Button>
      {msg && (
        <p className={`mt-1 text-xs ${state === "error" ? "text-danger-600" : "text-success-700"}`} role="status">
          {msg}
        </p>
      )}
    </div>
  );
}

export function CalendarButton({ reference }: { reference: string }) {
  return (
    <Button href={`/api/bookings/${reference}/calendar`} variant="outline" leftIcon={<CalendarPlus className="h-4 w-4" aria-hidden />}>
      Add to calendar
    </Button>
  );
}

export function PrintButton() {
  return (
    <Button type="button" variant="outline" onClick={() => window.print()} leftIcon={<Printer className="h-4 w-4" aria-hidden />}>
      Print
    </Button>
  );
}

export function CancelBooking({ reference, fullRefund, fareBrand, refundable }: { reference: string; fullRefund: boolean; fareBrand: string; refundable: boolean }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function confirm() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/bookings/${reference}/cancel`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "We couldn't cancel this booking online.");
      setLoading(false);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button type="button" variant="ghost" className="text-danger-600 hover:bg-danger-50" leftIcon={<XCircle className="h-4 w-4" aria-hidden />} onClick={() => setOpen(true)}>
        Cancel booking
      </Button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-float">
            <h2 id="cancel-title" className="text-xl font-bold text-navy-900">
              Cancel this booking?
            </h2>
            <div className="mt-3 text-sm text-slate-600">
              {fullRefund ? (
                <Alert tone="success" title="Full refund">
                  You booked within the last 24 hours and your flight is at least 7 days away, so you&apos;ll receive a full refund to your original payment method within 7 business days.
                </Alert>
              ) : (
                <Alert tone="warning" title="Refund depends on your fare">
                  Your {fareBrand} fare is {refundable ? "refundable — the airline refunds the fare less any applicable fee" : "non-refundable. You may receive a refund of taxes only, or an airline credit if the airline offers one"}. We&apos;ll email you the final refund amount once the airline processes the cancellation.
                </Alert>
              )}
              <p className="mt-3">This cancels all passengers and all flights on the booking. It can&apos;t be undone.</p>
            </div>
            {error && (
              <p className="mt-3 text-sm text-danger-600" role="alert">
                {error}
              </p>
            )}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
                Keep booking
              </Button>
              <Button type="button" variant="danger" onClick={confirm} loading={loading} leftIcon={<Trash2 className="h-4 w-4" aria-hidden />}>
                Yes, cancel booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function DeleteAlertButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      loading={loading}
      aria-label="Delete price alert"
      onClick={async () => {
        setLoading(true);
        await fetch(`/api/price-alerts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        router.refresh();
      }}
    >
      <Trash2 className="h-4 w-4" aria-hidden />
    </Button>
  );
}
