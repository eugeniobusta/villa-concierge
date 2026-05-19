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
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center max-w-sm px-6">
          <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-5">
            <Lock className="h-6 w-6 text-stone-400" />
          </div>
          <h1 className="text-xl font-semibold text-stone-800 mb-2">
            {t("title")}
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            {t("message")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GuestHeader session={session} locale={locale} token={token} />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
