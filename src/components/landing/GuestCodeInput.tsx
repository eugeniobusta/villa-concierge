"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, ScanLine, Loader2, KeyRound } from "lucide-react";

interface Props {
  /** compact = hero dark-glass card; default = modal on light/card bg */
  compact?: boolean;
}

export function GuestCodeInput({ compact }: Props) {
  const { locale } = useParams<{ locale: string }>();
  const [code, setCode]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  function navigate(token: string) {
    const clean = token.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!clean) { setError("Please enter a valid access code."); return; }
    setLoading(true);
    window.location.href = `/${locale}/stay/${clean}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(code);
  }

  /**
   * Opens the native camera app via a hidden file input with capture="environment".
   * On iOS (Safari) and Android (Chrome), this launches the device camera directly.
   * The native camera automatically detects QR codes and shows a system banner —
   * the user taps the banner and lands on the guest page. No image processing needed.
   */
  function openNativeCamera() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    // We don't process the file — the native OS handles QR detection and redirect
    const cleanup = () => { if (input.parentNode) input.remove(); };
    input.addEventListener("change", cleanup);
    input.addEventListener("cancel", cleanup);
    document.body.appendChild(input);
    input.click();
    // Safety cleanup after 2 minutes
    setTimeout(cleanup, 120_000);
  }

  const inputCls = compact
    ? "w-full rounded-xl border px-4 py-3 text-sm font-mono tracking-wider bg-white/15 border-white/40 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
    : "w-full rounded-xl border px-4 py-3 text-sm font-mono tracking-wider bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";

  const scanBtnCls = compact
    ? "mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/15 border border-white/30 text-white font-medium text-sm hover:bg-white/25 active:scale-[0.98] transition-all"
    : "mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-secondary active:scale-[0.98] transition-all";

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
          placeholder="e.g. HKGEFEBQ"
          maxLength={20}
          autoComplete="off"
          spellCheck={false}
          className={inputCls}
        />
        <button
          type="submit"
          disabled={!code.trim() || loading}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98] transition-all shadow-warm flex-shrink-0"
        >
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <><span className="hidden sm:inline">Enter</span><ArrowRight className="h-4 w-4" /></>
          }
        </button>
      </form>

      {/* Opens device camera — native QR detection handles the redirect */}
      <button onClick={openNativeCamera} className={scanBtnCls}>
        <ScanLine className="h-4 w-4" />
        Scan QR Code
      </button>

      {error && (
        <p className={`mt-2 text-xs ${compact ? "text-red-300" : "text-destructive"}`}>{error}</p>
      )}
    </div>
  );
}

/* ── Card wrapper used in the hero ── */
export function GuestAccessCard() {
  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/18 rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-7 h-7 rounded-lg bg-primary/30 flex items-center justify-center flex-shrink-0">
          <KeyRound className="h-4 w-4 text-primary" />
        </div>
        <p className="text-white font-semibold text-sm">Access your villa services</p>
      </div>
      <p className="text-white/80 text-xs mb-4 leading-relaxed">
        Enter the code your host shared, or scan the QR code at your villa with your camera.
      </p>
      <GuestCodeInput compact />
    </div>
  );
}
