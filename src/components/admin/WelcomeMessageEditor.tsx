"use client";

import { useState, useTransition } from "react";
import { updateWelcomeMessageAction } from "@/actions/stays";
import { Loader2, Pencil, Check, X } from "lucide-react";

interface Props {
  stayId: string;
  initial: string | null;
}

export default function WelcomeMessageEditor({ stayId, initial }: Props) {
  const [editing,    setEditing]    = useState(false);
  const [value,      setValue]      = useState(initial ?? "");
  const [saved,      setSaved]      = useState(initial ?? "");
  const [isPending,  startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await updateWelcomeMessageAction(stayId, value);
      if (!result?.error) {
        setSaved(value);
        setEditing(false);
      }
    });
  }

  function cancel() {
    setValue(saved);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="group relative">
        {saved ? (
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed pr-8">
            {saved}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground/50 italic">No welcome message set yet.</p>
        )}
        <button
          onClick={() => setEditing(true)}
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-muted transition-all"
          title="Edit welcome message"
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        autoFocus
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
        placeholder={"Welcome, Maria!\n\nWiFi: Casa123 · Pool towels in the terrace cabinet.\nCheckout is at 11am. Enjoy your stay!"}
      />
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {isPending
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <Check className="h-3 w-3" />
          }
          Save
        </button>
        <button
          onClick={cancel}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted disabled:opacity-50 transition-all"
        >
          <X className="h-3 w-3" /> Cancel
        </button>
      </div>
    </div>
  );
}
