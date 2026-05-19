import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { deleteStayAction } from "@/actions/stays";
import CopyButton from "@/components/admin/CopyButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

function stayStatus(checkIn: string, checkOut: string) {
  const today = new Date().toISOString().split("T")[0];
  if (today < checkIn) return { label: "Upcoming", cls: "bg-blue-50 text-blue-700 border-blue-100" };
  if (today > checkOut) return { label: "Expired",  cls: "bg-stone-100 text-stone-500 border-stone-200" };
  return { label: "Active", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" };
}

function fmt(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const guestLink = `${appUrl}/${locale}/stay/${stay.access_token}`;
  const status = stayStatus(stay.check_in, stay.check_out);

  const deleteWithLocale = deleteStayAction.bind(null, stay.id, locale);

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href={`/${locale}/admin/stays`}
        className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Stays
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">{stay.guest_name}</h1>
          <p className="text-stone-400 text-sm mt-0.5">
            {fmt(stay.check_in)} – {fmt(stay.check_out)}
          </p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${status.cls}`}>
          {status.label}
        </span>
      </div>

      {/* Access Link — the most important part of this page */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-4">
        <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
          Guest Access Link
        </p>
        <div className="flex items-center gap-2 bg-stone-50 rounded-xl px-4 py-3 mb-3">
          <code className="text-sm text-stone-700 flex-1 break-all">{guestLink}</code>
        </div>
        <div className="flex gap-2">
          <CopyButton text={guestLink} label="Copy link" />
          <a href={guestLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" /> Preview
            </Button>
          </a>
        </div>
        <p className="text-xs text-stone-400 mt-3">
          Share this link with your guest via WhatsApp, email, or embed it in a QR code.
          It only works between {fmt(stay.check_in)} and {fmt(stay.check_out)}.
        </p>
      </div>

      {/* Guest details */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-4">
        <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-4">Details</p>
        <dl className="space-y-3 text-sm">
          {stay.guest_email && (
            <div className="flex justify-between">
              <dt className="text-stone-400">Email</dt>
              <dd className="text-stone-700">{stay.guest_email}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-stone-400">Access token</dt>
            <dd><code className="text-xs bg-stone-100 px-2 py-0.5 rounded font-mono">{stay.access_token}</code></dd>
          </div>
          {stay.notes && (
            <div>
              <dt className="text-stone-400 mb-1">Notes</dt>
              <dd className="text-stone-700 bg-stone-50 rounded-lg px-3 py-2">{stay.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Bookings — Phase 5 */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Bookings</p>
        <p className="text-sm text-stone-400">Booking management arrives in Phase 5.</p>
      </div>

      {/* Danger zone */}
      <div className="border border-red-100 rounded-2xl p-5">
        <p className="text-sm font-medium text-red-700 mb-1">Delete Stay</p>
        <p className="text-xs text-red-400 mb-3">
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
