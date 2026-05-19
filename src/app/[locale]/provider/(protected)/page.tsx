import { redirect } from "next/navigation";

export default async function ProviderRootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/provider/dashboard`);
}
