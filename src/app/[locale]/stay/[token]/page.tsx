import { Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Phase 4: This page will validate the token, check stay dates,
// and render the full service booking portal for the guest.

export default async function GuestPortalPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFAF5]">
      <div className="text-center max-w-sm px-6">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Sun className="h-6 w-6 text-amber-600" />
        </div>
        <Badge
          variant="secondary"
          className="mb-4 bg-amber-100 text-amber-800 border-amber-200"
        >
          Guest Portal
        </Badge>
        <h1 className="text-2xl font-semibold text-stone-900 mb-2">
          Welcome to your stay
        </h1>
        <p className="text-stone-500 text-sm mb-6">
          Services will be available here in the next phase.
        </p>
        <p className="text-xs text-stone-300 font-mono">token: {token}</p>
      </div>
    </div>
  );
}
