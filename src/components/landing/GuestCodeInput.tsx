"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, ScanLine, Loader2, KeyRound, X } from "lucide-react";
import jsQR from "jsqr";

interface Props {
  compact?: boolean;
}

export function GuestCodeInput({ compact }: Props) {
  const { locale } = useParams<{ locale: string }>();
  const [code,     setCode]     = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState("");

  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const rafRef      = useRef<number>(0);
  const activeRef   = useRef(false); // tracks whether scan loop should keep running

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

  const stopScanning = useCallback(() => {
    activeRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  // Start scanner when `scanning` flips to true
  useEffect(() => {
    if (!scanning) return;
    activeRef.current = true;

    async function init() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCamError("Camera not available in this browser.");
        setScanning(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        tick();
      } catch {
        setCamError("Camera access was denied. Type your access code manually.");
        setScanning(false);
      }
    }

    function tick() {
      if (!activeRef.current) return;
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) { rafRef.current = requestAnimationFrame(tick); return; }

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qr  = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
          if (qr?.data) {
            stopScanning();
            // Navigate to the QR URL directly — it IS the guest portal link
            window.location.href = qr.data;
            return;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    init();
    return () => {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [scanning, stopScanning]);

  const inputCls = compact
    ? "w-full rounded-xl border px-4 py-3 text-sm font-mono tracking-wider bg-white/15 border-white/40 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
    : "w-full rounded-xl border px-4 py-3 text-sm font-mono tracking-wider bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";

  const scanBtnCls = compact
    ? "mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/15 border border-white/30 text-white font-medium text-sm hover:bg-white/25 active:scale-[0.98] transition-all"
    : "mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-secondary active:scale-[0.98] transition-all";

  return (
    <>
      {/* ── Scanner overlay ── */}
      {scanning && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanning frame corners */}
          <div className="relative z-10 w-64 h-64 sm:w-72 sm:h-72">
            {/* top-left */}
            <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
            {/* top-right */}
            <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
            {/* bottom-left */}
            <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
            {/* bottom-right */}
            <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
            {/* Animated scan line */}
            <div
              className="absolute left-2 right-2 h-0.5 bg-primary opacity-80"
              style={{ animation: "qr-scan-line 2s ease-in-out infinite" }}
            />
          </div>

          <p className="relative z-10 mt-6 text-white/80 text-sm font-medium">
            Point at the QR code at your villa
          </p>

          <button
            onClick={stopScanning}
            className="relative z-10 mt-6 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 border border-white/25 text-white text-sm hover:bg-white/25 transition-all"
          >
            <X className="h-4 w-4" /> Cancel
          </button>

          <style>{`
            @keyframes qr-scan-line {
              0%   { top: 8px;  }
              50%  { top: calc(100% - 8px); }
              100% { top: 8px;  }
            }
          `}</style>
        </div>
      )}

      {/* ── Input form ── */}
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

        <button
          onClick={() => { setCamError(""); setScanning(true); }}
          className={scanBtnCls}
        >
          <ScanLine className="h-4 w-4" />
          Scan QR Code
        </button>

        {(error || camError) && (
          <p className={`mt-2 text-xs ${compact ? "text-red-300" : "text-destructive"}`}>
            {error || camError}
          </p>
        )}
      </div>
    </>
  );
}

/* ── Card wrapper used in the hero ── */
export function GuestAccessCard() {
  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/18 rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
          <KeyRound className="h-4 w-4 text-white" />
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
