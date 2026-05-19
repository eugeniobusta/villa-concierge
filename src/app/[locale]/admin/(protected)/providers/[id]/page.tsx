"use client";

import { useActionState, useEffect, useState } from "react";
import { updateProviderAction } from "@/actions/providers";
import { linkProviderAccountAction } from "@/actions/availability";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Provider, Service } from "@/types/database";

export default function EditProviderPage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const [state, formAction, isPending] = useActionState(updateProviderAction, null);
  const [linkState, linkFormAction, linkPending] = useActionState(linkProviderAccountAction, null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const anon = createClient();
    Promise.all([
      anon.from("providers").select("*").eq("id", id).single(),
      anon.from("services").select("*").eq("is_active", true).order("sort_order"),
      anon.from("provider_services").select("service_id").eq("provider_id", id),
    ]).then(([{ data: prov }, { data: svcs }, { data: links }]) => {
      setProvider(prov);
      setServices(svcs ?? []);
      setSelectedIds(new Set(links?.map((l) => l.service_id) ?? []));
    });
  }, [id]);

  if (!provider) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  const bioEn = (provider.bio as Record<string, string> | null)?.en ?? "";

  return (
    <div className="p-4 md:p-8 max-w-2xl space-y-4">
      <Link
        href={`/${locale}/admin/providers`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Providers
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-0.5">Edit Provider</h1>
        <p className="text-sm text-muted-foreground">{provider.name}</p>
      </div>

      {/* Provider details form */}
      <div className="bg-card rounded-2xl border border-border p-8 shadow-warm-sm">
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value={provider.id} />
          <input type="hidden" name="is_active" value={String(provider.is_active)} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" defaultValue={provider.name} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={provider.email ?? ""} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={provider.phone ?? ""} />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="bio_en">Short Bio (English)</Label>
              <Input id="bio_en" name="bio_en" defaultValue={bioEn} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="commission_rate">Commission Rate (%)</Label>
              <Input
                id="commission_rate"
                name="commission_rate"
                type="number"
                min="1"
                max="100"
                defaultValue={Math.round(provider.commission_rate * 100)}
                required
              />
            </div>
          </div>

          {services.length > 0 && (
            <div className="space-y-2">
              <Label>Services Offered</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {services.map((svc) => (
                  <label
                    key={svc.id}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border hover:bg-secondary cursor-pointer text-sm transition-colors"
                  >
                    <input
                      type="checkbox"
                      name="service_ids"
                      value={svc.id}
                      defaultChecked={selectedIds.has(svc.id)}
                      className="accent-primary"
                    />
                    <span className="text-foreground">
                      {(svc.name as Record<string, string>).en}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {state?.error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2.5 rounded-lg">
              {state.error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Link href={`/${locale}/admin/providers`}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>

      {/* Portal access link */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-warm-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-0.5">Provider Portal Access</p>
            <p className="text-xs text-muted-foreground">
              {provider.user_id
                ? "This provider can log in to the provider portal."
                : "Not linked yet. Enter their email to give portal access."}
            </p>
          </div>
          {provider.user_id && (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          )}
        </div>

        <form action={linkFormAction} className="flex gap-2">
          <input type="hidden" name="provider_id" value={provider.id} />
          <Input
            name="provider_email"
            type="email"
            placeholder={provider.email ?? "provider@email.com"}
            defaultValue={provider.email ?? ""}
            className="flex-1 text-sm"
          />
          <Button type="submit" variant="outline" size="sm" disabled={linkPending}>
            {linkPending ? "Linking…" : provider.user_id ? "Re-link" : "Link account"}
          </Button>
        </form>

        {"error" in (linkState ?? {}) && (
          <p className="text-xs text-destructive mt-2">{(linkState as { error: string }).error}</p>
        )}
        {"success" in (linkState ?? {}) && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
            {(linkState as { success: string }).success}
          </p>
        )}

        <p className="text-xs text-muted-foreground/50 mt-3">
          The provider must have a Supabase account first — create one in Supabase Dashboard → Authentication → Users.
        </p>
      </div>
    </div>
  );
}
