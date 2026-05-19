// This layout is the auth gate for every page under /admin/* EXCEPT /admin/login.
// Route groups (the "(protected)" folder name) don't appear in the URL —
// /admin/dashboard and /admin/stays both get this layout invisibly.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Toaster } from "@/components/ui/sonner";

export default async function ProtectedAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // getUser() calls Supabase servers to verify the JWT — it can't be faked.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ADMIN_EMAIL supports a single email or a comma-separated list:
  //   ADMIN_EMAIL=alice@example.com
  //   ADMIN_EMAIL=alice@example.com,bob@example.com
  const adminEmails = (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = user?.email?.trim().toLowerCase();

  if (!user || adminEmails.length === 0 || !userEmail || !adminEmails.includes(userEmail)) {
    redirect(`/${locale}/admin/login`);
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar locale={locale} userEmail={user.email!} />
      <main className="flex-1 overflow-auto">{children}</main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
