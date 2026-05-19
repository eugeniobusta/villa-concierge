import { Skeleton } from "@/components/ui/skeleton";

export default function BookingsLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Skeleton className="h-4 w-36 mb-6" />

      {/* Title */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Booking cards — different heights for visual variety */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="space-y-2 text-right flex-shrink-0">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 ml-auto" />
              </div>
            </div>
            {i === 0 && (
              <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-40 rounded-xl" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
