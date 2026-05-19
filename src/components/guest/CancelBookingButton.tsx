"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { cancelBookingAction } from "@/actions/bookings";
import { Loader2, Trash2 } from "lucide-react";

interface Props {
  bookingId: string;
  token: string;
  locale: string;
}

export function CancelBookingButton({ bookingId, token, locale }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("guest.bookings");

  function handleCancel() {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("booking_id", bookingId);
      fd.append("token", token);
      fd.append("locale", locale);
      await cancelBookingAction(fd);
    });
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors duration-150"
      >
        <Trash2 className="h-3 w-3" />
        {t("cancel")}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs text-muted-foreground">{t("cancelConfirm")}</span>
      <button
        onClick={handleCancel}
        disabled={isPending}
        className="flex items-center gap-1.5 text-xs font-medium text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50"
      >
        {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
        {isPending ? t("cancelling") : t("confirmCancel")}
      </button>
      {!isPending && (
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("keepBooking")}
        </button>
      )}
    </div>
  );
}
