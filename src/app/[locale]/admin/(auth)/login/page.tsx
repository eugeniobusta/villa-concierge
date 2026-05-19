"use client";

import { useActionState, useEffect } from "react";
import { loginAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SanchamarLogo } from "@/components/SanchamarLogo";
import { useParams } from "next/navigation";

export default function LoginPage() {
  const { locale } = useParams<{ locale: string }>();
  const [state, formAction, isPending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state && "redirect" in state) {
      window.location.href = state.redirect;
    }
  }, [state]);

  const error = state && "error" in state ? state.error : null;
  const isRedirecting = state && "redirect" in state;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <SanchamarLogo variant="full" height={40} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">Admin Portal</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-warm-sm">
          <form action={formAction} className="space-y-5">
            <input type="hidden" name="locale" value={locale} />

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="admin@yourmail.com" required autoFocus />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2.5 rounded-lg">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending || !!isRedirecting}>
              {isPending || isRedirecting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
