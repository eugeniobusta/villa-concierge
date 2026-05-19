import { Skeleton } from "@/components/ui/skeleton";

export default function BookingsLoading() {
  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="mb-6">
        <Skeleton className="h-8 w-44 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-x-auto shadow-warm-sm">
        {/* Header row */}
        <div className="flex gap-4 px-5 py-3 border-b border-border min-w-[600px]">
          {["Guest","Service","Provider","Date","Status","Total","Cut"].map((col) => (
            <Skeleton key={col} className="h-3 flex-1" />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 px-5 py-4 border-b border-border/50 last:border-0 animate-pulse min-w-[600px]"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-20 rounded-full flex-shrink-0" />
            <Skeleton className="h-4 w-14 flex-shrink-0" />
            <Skeleton className="h-4 w-14 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
