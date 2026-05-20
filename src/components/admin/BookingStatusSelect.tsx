"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { updateBookingStatusAction } from "@/actions/bookings";
import type { BookingStatus } from "@/types/database";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending:     "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300",
  confirmed:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  completed:   "bg-muted text-muted-foreground",
  cancelled:   "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:     "Pending",
  confirmed:   "Confirmed",
  in_progress: "In Progress",
  completed:   "Completed",
  cancelled:   "Cancelled",
};

const ALL_STATUSES: BookingStatus[] = [
  "pending", "confirmed", "in_progress", "completed", "cancelled",
];

interface Props {
  bookingId:     string;
  initialStatus: BookingStatus;
}

export default function BookingStatusSelect({ bookingId, initialStatus }: Props) {
  const [status, setStatus]   = useState<BookingStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: BookingStatus) {
    const prev = status;
    setStatus(next); // optimistic — user sees it instantly
    startTransition(async () => {
      const result = await updateBookingStatusAction(bookingId, next);
      if (result?.error) setStatus(prev); // revert if server rejected it
    });
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value as BookingStatus)}
        disabled={isPending}
        className={`
          appearance-none text-xs font-medium
          pl-2.5 pr-6 py-1 rounded-full
          cursor-pointer transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary/30
          disabled:opacity-60 disabled:cursor-not-allowed
          ${STATUS_STYLES[status]}
        `}
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>

      {/* Chevron / spinner sits inside the badge at the right edge */}
      <span className="pointer-events-none absolute right-1.5 flex items-center">
        {isPending
          ? <Loader2 className="h-3 w-3 animate-spin" />
          : <ChevronDown className="h-3 w-3 opacity-50" />
        }
      </span>
    </div>
  );
}
