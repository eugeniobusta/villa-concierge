"use client";

import { useTransition } from "react";
import { providerAcceptBookingAction, providerDeclineBookingAction } from "@/actions/bookings";
import { Check, X, Loader2 } from "lucide-react";

interface Props {
  bookingId: string;
}

export default function ProviderBookingActions({ bookingId }: Props) {
  const [isPending, startTransition] = useTransition();

  function accept() {
    startTransition(() => providerAcceptBookingAction(bookingId));
  }

  function decline() {
    if (!confirm("Decline this booking? The guest will be notified.")) return;
    startTransition(() => providerDeclineBookingAction(bookingId));
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={accept}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 dark:text-emerald-400 text-xs font-semibold transition-colors disabled:opacity-40"
      >
        {isPending
          ? <Loader2 className="h-3 w-3 animate-spin" />
          : <Check className="h-3 w-3" />
        }
        Accept
      </button>
      <button
        onClick={decline}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-950/50 dark:hover:bg-red-900/50 dark:text-red-400 text-xs font-semibold transition-colors disabled:opacity-40"
      >
        <X className="h-3 w-3" /> Decline
      </button>
    </div>
  );
}
