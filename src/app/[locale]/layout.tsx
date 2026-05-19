// Locale layout: wraps all /[locale]/* pages with the i18n provider.
// Does NOT include <html>/<body> — those live in the root layout above.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  title: "Sanchamar · Private Concierge Malaga",
  description:
    "Exclusive villa services at your fingertips — private chef, massage, transfers, yoga, wine & more. Book in minutes from your phone.",
  openGraph: {
    type:        "website",
    siteName:    "Sanchamar",
    title:       "Sanchamar · Private Concierge Malaga",
    description: "Exclusive villa services — private chef, massage, transfers, yoga, wine & more.",
    url:         APP_URL,
    images: [{
      url:    `${APP_URL}/og-image.jpg`,
      width:  1200,
      height: 630,
      alt:    "Sanchamar — Private Villa Concierge Malaga",
    }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Sanchamar · Private Concierge Malaga",
    description: "Exclusive villa services — private chef, massage, transfers, yoga, wine & more.",
    images:      [`${APP_URL}/og-image.jpg`],
  },
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
