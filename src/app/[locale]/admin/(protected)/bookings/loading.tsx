import { Skeleton } from "@/components/ui/skeleton";

export default function BookingsLoading() {
  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="mb-8">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-7 gap-4 px-5 py-3 border-b border-border">
          {["Guest", "Service", "Provider", "Date", "Status", "Total", "Cut"].map((col) => (
            <Skeleton key={col} className="h-3 w-full max-w-[80px]" />
          ))}
        </div>
        {/* Data rows — staggered fade animation */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-7 gap-4 px-5 py-4 border-b border-border/50 last:border-0 animate-pulse"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-14 ml-auto" />
            <Skeleton className="h-4 w-14 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
