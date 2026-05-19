// Locale layout: wraps all /[locale]/* pages with the i18n provider.
// Does NOT include <html>/<body> — those live in the root layout above.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Sanchamar · Private Concierge Malaga",
  description: "Sanchamar — exclusive private concierge services for your villa stay in Malaga.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
