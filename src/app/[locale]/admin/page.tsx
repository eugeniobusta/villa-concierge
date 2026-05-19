import { Badge } from "@/components/ui/badge";
import { LayoutDashboard } from "lucide-react";

// Phase 3: Admin dashboard — manage stays, providers, services, view bookings.

export default function AdminPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFAF5]">
      <div className="text-center max-w-sm px-6">
        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <LayoutDashboard className="h-6 w-6 text-stone-600" />
        </div>
        <Badge
          variant="secondary"
          className="mb-4 bg-stone-100 text-stone-700 border-stone-200"
        >
          Admin Portal
        </Badge>
        <h1 className="text-2xl font-semibold text-stone-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-stone-500 text-sm">
          Manage stays, providers, and services — coming in Phase 3.
        </p>
      </div>
    </div>
  );
}
