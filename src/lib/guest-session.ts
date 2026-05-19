import { cache } from "react";
import { createAdminClient } from "./supabase/admin";
import type { GuestSession } from "@/types/database";

// React.cache() deduplicates this call within a single request.
// The layout validates the token, then every child page can call
// getActiveSession(token) again — zero extra DB round-trips.
export const getActiveSession = cache(
  async (token: string): Promise<GuestSession | null> => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await createAdminClient()
      .from("guest_sessions")
      .select("*")
      .eq("access_token", token)
      .lte("check_in", today)  // check_in <= today
      .gte("check_out", today) // check_out >= today
      .single();
    return data;
  }
);

// All dates from check-in up to (but not including) check-out
export function getStayDates(checkIn: string, checkOut: string): string[] {
  const dates: string[] = [];
  const current = new Date(checkIn + "T00:00:00");
  const end = new Date(checkOut + "T00:00:00");
  while (current < end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function formatDate(
  dateStr: string,
  opts?: Intl.DateTimeFormatOptions & { locale?: string }
) {
  const { locale, ...dateOpts } = opts ?? {};
  return new Date(dateStr + "T00:00:00").toLocaleDateString(locale ?? "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...dateOpts,
  });
}
