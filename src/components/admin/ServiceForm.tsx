"use client";

import { useActionState, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createServiceAction, updateServiceAction } from "@/actions/services";
import type { ServiceCategory } from "@/types/database";

type MultiLang = Record<string, string>;

interface ServiceInit {
  id:                  string;
  name:                MultiLang;
  description:         MultiLang | null;
  category_id:         string;
  base_price:          number;
  price_unit:          string;
  min_duration_hours:  number | null;
  max_duration_hours:  number | null;
  requires_scheduling: boolean;
  sort_order:          number;
}

interface Props {
  categories: ServiceCategory[];
  initial?:   ServiceInit;
}

const PRICE_UNITS = [
  { value: "per_session", label: "Flat — per session" },
  { value: "flat",        label: "Flat — one-time fee" },
  { value: "per_hour",    label: "Per hour" },
  { value: "per_item",    label: "Per item / person" },
];

const LANGS = [
  { code: "es", label: "Spanish (ES)" },
  { code: "fr", label: "French (FR)"  },
  { code: "de", label: "German (DE)"  },
  { code: "it", label: "Italian (IT)" },
];

export default function ServiceForm({ categories, initial }: Props) {
  const { locale } = useParams<{ locale: string }>();
  const isEdit = !!initial;

  const action = isEdit ? updateServiceAction : createServiceAction;
  const [state, formAction, isPending] = useActionState(action, null);

  const [priceUnit, setPriceUnit] = useState(initial?.price_unit ?? "per_session");
  const [showTranslations, setShowTranslations] = useState(false);

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <Link
        href={`/${locale}/admin/services`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Services
      </Link>

      <h1 className="text-2xl font-semibold text-foreground mb-1">
        {isEdit ? "Edit Service" : "New Service"}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        {isEdit
          ? "Changes take effect immediately for all guests."
          : "The service will be visible to guests once a provider is assigned to it."}
      </p>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="locale" value={locale} />
        {isEdit && <input type="hidden" name="service_id" value={initial!.id} />}

        {/* ── Core fields ── */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-warm-sm space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Basic Info
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="name_en">Service name (English) *</Label>
            <Input
              id="name_en"
              name="name_en"
              placeholder="Boat Rental"
              defaultValue={initial?.name.en}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc_en">
              Description (English){" "}
              <span className="text-muted-foreground font-normal">optional</span>
            </Label>
            <textarea
              id="desc_en"
              name="desc_en"
              rows={2}
              placeholder="Private boat excursions along the Malaga coast…"
              defaultValue={initial?.description?.en}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category_id">Category *</Label>
            <select
              id="category_id"
              name="category_id"
              defaultValue={initial?.category_id}
              required
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            >
              <option value="">Select a category…</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {(cat.name as MultiLang).en}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Pricing ── */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-warm-sm space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Pricing
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="base_price">Base price (€) *</Label>
              <Input
                id="base_price"
                name="base_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="150.00"
                defaultValue={initial?.base_price}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price_unit">Billing type *</Label>
              <select
                id="price_unit"
                name="price_unit"
                defaultValue={initial?.price_unit ?? "per_session"}
                onChange={(e) => setPriceUnit(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              >
                {PRICE_UNITS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration — only for per_hour */}
          {priceUnit === "per_hour" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="min_duration_hours">Min hours</Label>
                <Input
                  id="min_duration_hours"
                  name="min_duration_hours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  placeholder="1"
                  defaultValue={initial?.min_duration_hours ?? undefined}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="max_duration_hours">Max hours</Label>
                <Input
                  id="max_duration_hours"
                  name="max_duration_hours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  placeholder="8"
                  defaultValue={initial?.max_duration_hours ?? undefined}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Options ── */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-warm-sm space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Options
          </p>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="requires_scheduling"
              defaultChecked={initial?.requires_scheduling ?? true}
              className="mt-0.5 accent-primary h-4 w-4"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Requires scheduling</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Guest picks a date and time when booking. Uncheck for on-demand services.
              </p>
            </div>
          </label>

          <div className="space-y-1.5">
            <Label htmlFor="sort_order">Display order</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              min="0"
              placeholder="0"
              defaultValue={initial?.sort_order ?? 0}
              className="w-28"
            />
            <p className="text-xs text-muted-foreground">Lower number = shown first.</p>
          </div>
        </div>

        {/* ── Translations (collapsible) ── */}
        <div className="bg-card rounded-2xl border border-border shadow-warm-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowTranslations((v) => !v)}
            className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-muted/30 transition-colors"
          >
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Translations
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Other languages default to English if left blank.
              </p>
            </div>
            {showTranslations
              ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground" />
            }
          </button>

          {showTranslations && (
            <div className="px-6 pb-6 space-y-5 border-t border-border pt-4">
              {LANGS.map(({ code, label }) => (
                <div key={code} className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <Input
                    name={`name_${code}`}
                    placeholder={`Name in ${label.split(" ")[0]}…`}
                    defaultValue={(initial?.name as MultiLang)?.[code]}
                  />
                  <textarea
                    name={`desc_${code}`}
                    rows={2}
                    placeholder={`Description in ${label.split(" ")[0]}…`}
                    defaultValue={(initial?.description as MultiLang | null)?.[code]}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition-all"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {state?.error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl">
            {state.error}
          </p>
        )}

        <div className="flex gap-3 pb-4">
          <Link href={`/${locale}/admin/services`}>
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isPending}>
            {isPending ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save changes" : "Create service")}
          </Button>
        </div>
      </form>
    </div>
  );
}
