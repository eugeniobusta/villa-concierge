import { Skeleton } from "@/components/ui/skeleton";

export default function GuestHomeLoading() {
  return (
    <div>
      {/* My Bookings banner skeleton */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 mb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Title */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 flex-shrink-0 rounded-full" style={{ width: `${60 + i * 15}px` }} />
        ))}
      </div>

      {/* Service cards grid — pulse with stagger */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5 animate-pulse"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <Skeleton className="w-11 h-11 rounded-xl mb-4" />
            <Skeleton className="h-4 w-4/5 mb-2" />
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-3/4 mb-4" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
