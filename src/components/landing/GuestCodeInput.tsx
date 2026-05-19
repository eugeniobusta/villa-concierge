"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, Camera, X, Loader2, KeyRound } from "lucide-react";

interface Props {
  /** compact = inside hero on dark background; default = modal on light/card bg */
  compact?: boolean;
  onClose?: () => void;
}

export function GuestCodeInput({ compact }: Props) {
  const { locale } = useParams<{ locale: string }>();
  const [code, setCode]         = useState("");
  const [error, setError]       = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading]   = useState(false);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef    = useRef<number>(0);

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

  const scanFrame = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (video.readyState < 2 || video.videoWidth === 0) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    import("jsqr").then(({ default: jsQR }) => {
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qr  = jsQR(img.data, img.width, img.height);
      if (qr) {
        const match = qr.data.match(/\/stay\/([A-Z0-9]+)/i);
        const token = match ? match[1] : qr.data;
        stopCamera();
        navigate(token);
        return;
      }
      rafRef.current = requestAnimationFrame(scanFrame);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        // Explicit play() required on iOS Safari
        await video.play().catch(() => {});
      }
      setScanning(true);
    } catch {
      setError("Camera access denied. Enter the code manually.");
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }

  useEffect(() => {
    if (!scanning) return;
    const video = videoRef.current;
    if (!video) return;

    function startScan() { rafRef.current = requestAnimationFrame(scanFrame); }

    // Start immediately if already loaded, otherwise wait
    if (video.readyState >= 2) {
      startScan();
    } else {
      video.addEventListener("loadeddata", startScan, { once: true });
      video.addEventListener("canplay",    startScan, { once: true });
    }
    return () => {
      cancelAnimationFrame(rafRef.current);
      video.removeEventListener("loadeddata", startScan);
      video.removeEventListener("canplay", startScan);
    };
  }, [scanning, scanFrame]);

  useEffect(() => () => stopCamera(), []);

  // ── Styling based on context (hero = glass; modal = solid) ──
  const inputCls = compact
    ? "w-full rounded-xl border px-4 py-3 text-sm font-mono tracking-wider bg-white/10 backdrop-blur-md border-white/30 text-white placeholder:text-white/45 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
    : "w-full rounded-xl border px-4 py-3 text-sm font-mono tracking-wider bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all";

  const scanBtnCls = compact
    ? "mt-2.5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/20 text-white/75 text-sm hover:bg-white/10 hover:text-white transition-all"
    : "mt-2.5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-muted-foreground text-sm hover:bg-secondary hover:text-foreground transition-all";

  return (
    <div className="w-full">
      {/* Camera preview */}
      {scanning && (
        <div className="relative mb-4 rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "4/3" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scan frame */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-44 h-44">
              <div className="absolute inset-0 border-2 border-primary/60 rounded-2xl" />
              {["top-0 left-0 border-t-2 border-l-2","top-0 right-0 border-t-2 border-r-2",
                "bottom-0 left-0 border-b-2 border-l-2","bottom-0 right-0 border-b-2 border-r-2"
              ].map((cls, i) => (
                <div key={i} className={`absolute w-6 h-6 border-primary rounded-sm ${cls}`} />
              ))}
            </div>
          </div>

          <button onClick={stopCamera}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
            <X className="h-4 w-4" />
          </button>
          <p className="absolute bottom-3 inset-x-0 text-center text-xs text-white/70 drop-shadow">
            Point camera at QR code
          </p>
        </div>
      )}

      {/* Code input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
          placeholder="Access code — e.g. HKGEFEBQ"
          maxLength={20}
          autoComplete="off"
          spellCheck={false}
          className={inputCls}
        />
        <button
          type="submit"
          disabled={!code.trim() || loading}
          className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-all shadow-warm whitespace-nowrap flex-shrink-0"
        >
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <><span className="hidden sm:inline">Enter</span><ArrowRight className="h-4 w-4" /></>
          }
        </button>
      </form>

      {!scanning && (
        <button onClick={startCamera} className={scanBtnCls}>
          <Camera className="h-4 w-4" />
          Scan QR Code
        </button>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-400 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

/* ── Standalone card for use in the hero ── */
export function GuestAccessCard() {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-lg bg-primary/25 flex items-center justify-center flex-shrink-0">
          <KeyRound className="h-4 w-4 text-primary" />
        </div>
        <p className="text-white font-semibold text-sm">Access your villa services</p>
      </div>
      <p className="text-white/55 text-xs mb-4 leading-relaxed">
        Enter the code your host shared or scan the QR code at your villa.
      </p>
      <GuestCodeInput compact />
    </div>
  );
}
