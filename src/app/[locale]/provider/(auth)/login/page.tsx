"use client";

import { useActionState } from "react";
import { providerLoginAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { useParams } from "next/navigation";

export default function ProviderLoginPage() {
  const { locale } = useParams<{ locale: string }>();
  const [state, formAction, isPending] = useActionState(providerLoginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-3">
            <CalendarDays className="h-6 w-6 text-sky-600" />
          </div>
          <h1 className="text-xl font-semibold text-stone-900">Villa Concierge</h1>
          <p className="text-sm text-stone-400 mt-1">Provider Portal</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          <form action={formAction} className="space-y-5">
            <input type="hidden" name="locale" value={locale} />

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="your@email.com" required autoFocus />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>

            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg">
                {state.error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
