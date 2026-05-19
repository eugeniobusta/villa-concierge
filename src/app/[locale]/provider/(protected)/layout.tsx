import { getProviderSession } from "@/lib/provider-session";
import { redirect } from "next/navigation";
import ProviderSidebar from "@/components/provider/ProviderSidebar";
import { ProviderTour } from "@/components/tour/ProviderTour";
import { Toaster } from "@/components/ui/sonner";

export default async function ProviderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const provider = await getProviderSession();

  if (!provider) {
    redirect(`/${locale}/provider/login`);
  }

  return (
    <div className="flex h-screen bg-background">
      <ProviderSidebar locale={locale} providerName={provider.name} />
      <main className="flex-1 overflow-auto">{children}</main>
      <Toaster richColors position="top-right" />
      {/* Spotlight tour — shown once on first login */}
      <ProviderTour providerName={provider.name} />
    </div>
  );
}
