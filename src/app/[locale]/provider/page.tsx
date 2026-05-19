import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

// Phase 6: Provider dashboard — manage availability, view bookings, track earnings.

export default function ProviderPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFAF5]">
      <div className="text-center max-w-sm px-6">
        <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-4">
          <CalendarDays className="h-6 w-6 text-sky-600" />
        </div>
        <Badge
          variant="secondary"
          className="mb-4 bg-sky-100 text-sky-800 border-sky-200"
        >
          Provider Portal
        </Badge>
        <h1 className="text-2xl font-semibold text-stone-900 mb-2">
          Provider Dashboard
        </h1>
        <p className="text-stone-500 text-sm">
          Availability management and bookings — coming in Phase 6.
        </p>
      </div>
    </div>
  );
}
