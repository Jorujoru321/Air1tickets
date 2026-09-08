"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <h1 className="text-3xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-slate-600">
        We hit an unexpected problem. Please try again — if it keeps happening, call us at {site.supportPhone} and we&apos;ll finish your booking by phone.
      </p>
      {error.digest && <p className="mt-2 text-xs text-slate-400">Reference: {error.digest}</p>}
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/" variant="outline">
          Go home
        </Button>
      </div>
    </div>
  );
}
