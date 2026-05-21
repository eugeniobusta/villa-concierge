import { getProviderSession } from "@/lib/provider-session";
import { createAdminClient } from "@/lib/supabase/admin";
import AvailabilityManager from "@/components/provider/AvailabilityManager";
import { notFound } from "next/navigation";

function getNext21Days(): string[] {
  return Array.from({ length: 21 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

export default async function AvailabilityPage() {
  const provider = await getProviderSession();
  if (!provider) notFound();

  const dates = getNext21Days();

  const { data: slots } = await createAdminClient()
    .from("availability_slots")
    .select("id, date, start_time, end_time")
    .eq("provider_id", provider.id)
    .in("date", dates)
    .eq("is_blocked", false)
    .order("start_time");

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Availability</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Set the times you&apos;re available to take bookings over the next 3 weeks.
        </p>
      </div>

      <AvailabilityManager
        slots={slots ?? []}
        dates={dates}
      />
    </div>
  );
}
