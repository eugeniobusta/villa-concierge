"use client";

import { useActionState, useEffect, useState } from "react";
import { updateProviderAction } from "@/actions/providers";
import { createAdminClient } from "@/lib/supabase/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Provider, Service } from "@/types/database";

export default function EditProviderPage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const [state, formAction, isPending] = useActionState(updateProviderAction, null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const anon = createClient();

    // Fetch provider (public read) and all services
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
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-stone-400 text-sm">Loading…</p>
      </div>
    );
  }

  const bioEn = (provider.bio as Record<string, string> | null)?.en ?? "";

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href={`/${locale}/admin/providers`}
        className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Providers
      </Link>

      <h1 className="text-2xl font-semibold text-stone-900 mb-1">Edit Provider</h1>
      <p className="text-sm text-stone-400 mb-8">{provider.name}</p>

      <div className="bg-white rounded-2xl border border-stone-200 p-8">
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value={provider.id} />
          <input type="hidden" name="is_active" value={String(provider.is_active)} />

          <div className="grid grid-cols-2 gap-4">
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

          {/* Services */}
          {services.length > 0 && (
            <div className="space-y-2">
              <Label>Services Offered</Label>
              <div className="grid grid-cols-2 gap-2">
                {services.map((svc) => (
                  <label
                    key={svc.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      name="service_ids"
                      value={svc.id}
                      defaultChecked={selectedIds.has(svc.id)}
                      className="accent-amber-600"
                    />
                    <span className="text-stone-700">
                      {(svc.name as Record<string, string>).en}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {state?.error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
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
    </div>
  );
}
