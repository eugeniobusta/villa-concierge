// This layout is the security gate for every guest page.
// It validates the token and stay dates on EVERY request.
// Children never render if the token is invalid or the stay has ended.

import { getTranslations } from "next-intl/server";
import { getActiveSession } from "@/lib/guest-session";
import GuestHeader from "@/components/guest/GuestHeader";
import { Lock } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-sm px-6">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 shadow-warm-sm">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-3">{t("title")}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">{t("message")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GuestHeader session={session} locale={locale} token={token} />
      <main className="max-w-5xl mx-auto px-5 py-10">{children}</main>
    </div>
  );
}
