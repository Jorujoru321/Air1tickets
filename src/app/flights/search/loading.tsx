import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="bg-slate-50" aria-busy="true">
      <div className="border-b border-slate-200 bg-white">
        <div className="container-page py-4">
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
      <div className="container-page py-6">
        <div className="grid gap-6 lg:grid-cols-[17.5rem_1fr]">
          <Skeleton className="hidden h-96 lg:block" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
