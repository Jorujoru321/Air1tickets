import { Button } from "@/components/ui/Button";
import { PlaneTakeoff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-600">
        <PlaneTakeoff className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="mt-6 text-3xl sm:text-4xl">This page has departed</h1>
      <p className="mt-3 max-w-md text-slate-600">We couldn&apos;t find the page you were looking for. It may have moved, or the link may be out of date.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/">Search flights</Button>
        <Button href="/help" variant="outline">
          Visit the help center
        </Button>
      </div>
    </div>
  );
}
