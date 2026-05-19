"use client";

// Why "use client" if we're using a Server Action?
// useActionState is a React 19 hook (client-side) that wires the
// server action to the form and gives us isPending + error state.
// The actual auth logic runs entirely on the server — no browser
// Supabase client, no window.location, no hydration dependency.

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sun } from "lucide-react";
import { useParams } from "next/navigation";

export default function LoginPage() {
  const { locale } = useParams<{ locale: string }>();
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
            <Sun className="h-6 w-6 text-amber-600" />
          </div>
          <h1 className="text-xl font-semibold text-stone-900">Villa Concierge</h1>
          <p className="text-sm text-stone-400 mt-1">Admin Portal</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          <form action={formAction} className="space-y-5">
            {/* Pass locale to the server action so it can redirect correctly */}
            <input type="hidden" name="locale" value={locale} />

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@yourmail.com"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
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
