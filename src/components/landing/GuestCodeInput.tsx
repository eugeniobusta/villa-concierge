"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, Camera, Loader2, KeyRound } from "lucide-react";

interface Props {
  /** compact = hero dark-glass card; default = modal on light/card bg */
  compact?: boolean;
}

export function GuestCodeInput({ compact }: Props) {
  const { locale } = useParams<{ locale: string }>();
  const [code, setCode]   = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);

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

  /** Try to read QR from the captured image using jsQR (optional fallback) */
  async function handleCameraCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can re-trigger
    e.target.value = "";

    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(bitmap, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { default: jsQR } = await import("jsqr");
      const qr = jsQR(imageData.data, imageData.width, imageData.height);
      if (qr) {
        const match = qr.data.match(/\/stay\/([A-Z0-9]+)/i);
        navigate(match ? match[1] : qr.data);
      } else {
        setError("No QR code found. Enter your code manually.");
      }
    } catch {
      setError("Could not read image. Enter your code manually.");
    }
  }

  // Compact = dark glass on hero; non-compact = solid on white modal
  const inputCls = compact
    ? "w-full rounded-xl border px-4 py-3 text-sm font-mono tracking-wider bg-white/15 border-white/40 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
    : "w-full rounded-xl border px-4 py-3 text-sm font-mono tracking-wider bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";

  const scanBtnCls = compact
    ? "mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/15 border border-white/30 text-white font-medium text-sm hover:bg-white/25 transition-all"
    : "mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-secondary transition-all";

  return (
    <div className="w-full">
      {/* Hidden native camera input — opens device camera directly on mobile */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraCapture}
      />

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
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all shadow-warm flex-shrink-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <><span className="hidden sm:inline">Enter</span><ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>

      <button
        onClick={() => cameraRef.current?.click()}
        className={scanBtnCls}
      >
        <Camera className="h-4 w-4" />
        Open Camera
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
    // Dark glass card — readable on ANY hero gradient (light or dark mode)
    <div className="bg-black/40 backdrop-blur-md border border-white/18 rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-7 h-7 rounded-lg bg-primary/30 flex items-center justify-center flex-shrink-0">
          <KeyRound className="h-4 w-4 text-primary" />
        </div>
        <p className="text-white font-semibold text-sm">Access your villa services</p>
      </div>
      <p className="text-white/80 text-xs mb-4 leading-relaxed">
        Enter the code your host shared, or open your camera to scan the QR code at your villa.
      </p>
      <GuestCodeInput compact />
    </div>
  );
}
