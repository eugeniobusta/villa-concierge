import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderDashboardLoading() {
  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-44" />
      </div>

      {/* Stats — 3 cards with ripple shimmer effect */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-4 overflow-hidden relative"
          >
            <div
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]"
              style={{ animationDelay: `${i * 300}ms` }}
            />
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Upcoming bookings list */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <Skeleton className="h-4 w-40 mb-5" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-5 w-20 rounded-full ml-auto" />
                <Skeleton className="h-3 w-12 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
