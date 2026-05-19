// This layout is the security gate for every guest page.
// It validates the token and stay dates on EVERY request.
// Children never render if the token is invalid or the stay has ended.

import { getTranslations } from "next-intl/server";
import { getActiveSession } from "@/lib/guest-session";
import GuestHeader from "@/components/guest/GuestHeader";
import { SanchamarLogo } from "@/components/SanchamarLogo";
import { GuestCodeInput } from "@/components/landing/GuestCodeInput";
import { GuestTour } from "@/components/tour/GuestTour";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";

export default async function GuestLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  const [session, t] = await Promise.all([
    getActiveSession(token),
    getTranslations("guest.access"),
  ]);

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-5 py-16">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <SanchamarLogo variant="full" height={34} />
          </div>

          {/* Error card */}
          <div className="bg-card border border-border rounded-3xl p-7 shadow-warm text-center mb-4">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
              <Lock className="h-6 w-6 text-destructive/70" />
            </div>
            <h1 className="text-lg font-semibold text-foreground mb-2">{t("title")}</h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {t("message")}
            </p>

            {/* Try again */}
            <div className="text-left">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Try a different code
              </p>
              <GuestCodeInput />
            </div>
          </div>

          <Link
            href={`/${locale}`}
            className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GuestHeader session={session} locale={locale} token={token} />
      <main className="max-w-5xl mx-auto px-5 py-10">{children}</main>
      {/* Spotlight tour — shown once on first visit */}
      <GuestTour guestName={session.guest_name} />
    </div>
  );
}
