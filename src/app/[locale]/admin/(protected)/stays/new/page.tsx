"use client";

// useActionState is a React 19 hook. It wires a Server Action to a form and gives you:
//   state    — the last return value of the action (null initially, or { error: "..." })
//   formAction — pass this to <form action={...}>
//   isPending  — true while the server action is running (disables submit button)

import { useActionState } from "react";
import { createStayAction } from "@/actions/stays";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function NewStayPage() {
  const { locale } = useParams<{ locale: string }>();
  const [state, formAction, isPending] = useActionState(createStayAction, null);

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href={`/${locale}/admin/stays`}
        className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Stays
      </Link>

      <h1 className="text-2xl font-semibold text-stone-900 mb-1">New Guest Stay</h1>
      <p className="text-sm text-stone-400 mb-8">
        A unique access link will be generated automatically.
      </p>

      <div className="bg-white rounded-2xl border border-stone-200 p-8">
        <form action={formAction} className="space-y-5">
          {/* Hidden locale so the server action knows where to redirect */}
          <input type="hidden" name="locale" value={locale} />

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="guest_name">Guest Name *</Label>
              <Input id="guest_name" name="guest_name" placeholder="Maria Santos" required />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="guest_email">Guest Email <span className="text-stone-400 font-normal">(optional)</span></Label>
              <Input id="guest_email" name="guest_email" type="email" placeholder="maria@example.com" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="check_in">Check-in *</Label>
              <Input id="check_in" name="check_in" type="date" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="check_out">Check-out *</Label>
              <Input id="check_out" name="check_out" type="date" required />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="notes">Notes <span className="text-stone-400 font-normal">(optional)</span></Label>
              <Input id="notes" name="notes" placeholder="Family of 4, allergic to nuts…" />
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {state.error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Link href={`/${locale}/admin/stays`}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating…" : "Create Stay & Generate Link"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
