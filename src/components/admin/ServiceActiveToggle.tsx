"use client";

import { useState, useTransition } from "react";
import { toggleServiceActiveAction } from "@/actions/services";

interface Props {
  serviceId: string;
  initial:   boolean;
}

export default function ServiceActiveToggle({ serviceId, initial }: Props) {
  const [active, setActive]          = useState(initial);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !active;
    setActive(next);
    startTransition(async () => {
      const result = await toggleServiceActiveAction(serviceId, next);
      if (result?.error) setActive(!next); // revert on failure
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      title={active ? "Deactivate" : "Activate"}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
        active ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
          active ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
