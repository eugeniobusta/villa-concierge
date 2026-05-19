import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { deleteStayAction } from "@/actions/stays";
import CopyButton from "@/components/admin/CopyButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { BookingStatus } from "@/types/database";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending:     "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300",
  confirmed:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  completed:   "bg-muted text-muted-foreground",
  cancelled:   "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
};

function stayStatus(checkIn: string, checkOut: string) {
  const today = new Date().toISOString().split("T")[0];
  if (today < checkIn) return { label: "Upcoming", cls: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-900" };
  if (today > checkOut) return { label: "Expired",  cls: "bg-muted text-muted-foreground border-border" };
  return { label: "Active", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900" };
}

function fmt(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
}

function fmtShort(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "short",
  });
}

export default async function StayDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const db = createAdminClient();

  const { data: stay } = await db
    .from("guest_sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (!stay) notFound();

  // Fetch bookings for this stay
  const { data: bookings } = await db
    .from("bookings")
    .select("*")
    .eq("guest_session_id", id)
    .order("booking_date", { ascending: true });

  // Resolve service names via flat queries
  const psIds = [...new Set((bookings ?? []).map((b) => b.provider_service_id))];
  const { data: psRows } = psIds.length
    ? await db.from("provider_services").select("id, service_id").in("id", psIds)
    : { data: [] };
  const svcIds = [...new Set((psRows ?? []).map((p) => p.service_id))];
  const { data: svcRows } = svcIds.length
    ? await db.from("services").select("id, name").in("id", svcIds)
    : { data: [] };
  const psToSvc = Object.fromEntries((psRows ?? []).map((p) => [p.id, p.service_id]));
  const svcNames = Object.fromEntries((svcRows ?? []).map((s) => [s.id, (s.name as Record<string, string>).en]));

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const guestLink = `${appUrl}/${locale}/stay/${stay.access_token}`;
  const status = stayStatus(stay.check_in, stay.check_out);
  const deleteWithLocale = deleteStayAction.bind(null, stay.id, locale);

  const totalRevenue = (bookings ?? [])
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + b.total_amount, 0);

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href={`/${locale}/admin/stays`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Stays
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{stay.guest_name}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {fmt(stay.check_in)} – {fmt(stay.check_out)}
          </p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${status.cls}`}>
          {status.label}
        </span>
      </div>

      {/* Access Link */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-4 shadow-warm-sm">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Guest Access Link
        </p>
        <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3 mb-3">
          <code className="text-sm text-foreground flex-1 break-all">{guestLink}</code>
        </div>
        <div className="flex gap-2">
          <CopyButton text={guestLink} label="Copy link" />
          <a href={guestLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" /> Preview
            </Button>
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Share this with your guest via WhatsApp or email. Active between{" "}
          {fmtShort(stay.check_in)} and {fmtShort(stay.check_out)}.
        </p>
      </div>

      {/* Guest details */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-4 shadow-warm-sm">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Details</p>
        <dl className="space-y-3 text-sm">
          {stay.guest_email && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="text-foreground">{stay.guest_email}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Access token</dt>
            <dd>
              <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">
                {stay.access_token}
              </code>
            </dd>
          </div>
          {stay.notes && (
            <div>
              <dt className="text-muted-foreground mb-1">Notes</dt>
              <dd className="text-foreground bg-muted/50 rounded-lg px-3 py-2">{stay.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Bookings */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-4 shadow-warm-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bookings</p>
          {(bookings?.length ?? 0) > 0 && (
            <p className="text-xs text-muted-foreground">
              €{totalRevenue.toFixed(2)} total
            </p>
          )}
        </div>
        {!bookings?.length ? (
          <p className="text-sm text-muted-foreground">No bookings yet for this stay.</p>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => {
              const svcName = svcNames[psToSvc[b.provider_service_id]] ?? "Service";
              return (
                <div key={b.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{svcName}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmtShort(b.booking_date)}
                      {b.start_time && ` · ${b.start_time.slice(0, 5)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[b.status as BookingStatus]}`}>
                      {b.status.replace("_", " ")}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">€{b.total_amount.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="border border-destructive/30 rounded-2xl p-5">
        <p className="text-sm font-medium text-destructive mb-1">Delete Stay</p>
        <p className="text-xs text-muted-foreground mb-3">
          This permanently removes the stay and revokes the guest&apos;s access link.
        </p>
        <form action={deleteWithLocale}>
          <Button type="submit" variant="destructive" size="sm">
            Delete stay
          </Button>
        </form>
      </div>
    </div>
  );
}
