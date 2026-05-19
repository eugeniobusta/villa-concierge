"use client";

import { useActionState } from "react";
import { createProviderAction } from "@/actions/providers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Service } from "@/types/database";

export default function NewProviderPage() {
  const { locale } = useParams<{ locale: string }>();
  const [state, formAction, isPending] = useActionState(createProviderAction, null);
  const [services, setServices] = useState<Service[]>([]);

  // Fetch the services catalog so we can show checkboxes.
  // Using the browser client + anon key — services are public-read per RLS.
  useEffect(() => {
    createClient()
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setServices(data ?? []));
  }, []);

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href={`/${locale}/admin/providers`}
        className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Providers
      </Link>

      <h1 className="text-2xl font-semibold text-stone-900 mb-1">Add Provider</h1>
      <p className="text-sm text-stone-400 mb-8">Add a trusted person who will receive bookings.</p>

      <div className="bg-white rounded-2xl border border-stone-200 p-8">
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="locale" value={locale} />

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" placeholder="Carlos García" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="carlos@example.com" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+34 600 123 456" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="bio_en">Short Bio (English)</Label>
              <Input
                id="bio_en"
                name="bio_en"
                placeholder="Michelin-trained chef with 10 years in Marbella…"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="commission_rate">
                Commission Rate (%) *
              </Label>
              <Input
                id="commission_rate"
                name="commission_rate"
                type="number"
                min="1"
                max="100"
                defaultValue="85"
                required
              />
              <p className="text-xs text-stone-400">
                The % of each booking the provider receives. You keep the rest.
              </p>
            </div>
          </div>

          {/* Services checkboxes */}
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
              {isPending ? "Adding…" : "Add Provider"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
