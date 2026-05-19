"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, Camera, X, Loader2, QrCode } from "lucide-react";

interface Props {
  /** Compact = inside hero, default = inside modal */
  compact?: boolean;
  onClose?: () => void;
}

export function GuestCodeInput({ compact, onClose }: Props) {
  const { locale } = useParams<{ locale: string }>();
  const [code, setCode]         = useState("");
  const [error, setError]       = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading]   = useState(false);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef    = useRef<number>(0);

  /* Navigate to the guest page */
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

  /* ── Camera / QR ── */
  const scanFrame = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    // Lazy-load jsQR so it doesn't bloat the initial bundle
    import("jsqr").then(({ default: jsQR }) => {
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qr  = jsQR(img.data, img.width, img.height);
      if (qr) {
        // Extract token from a full URL or bare token
        const match = qr.data.match(/\/stay\/([A-Z0-9]+)/i);
        const token = match ? match[1] : qr.data;
        stopCamera();
        navigate(token);
        return;
      }
      rafRef.current = requestAnimationFrame(scanFrame);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function startCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
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

  // Start scanning once the video is ready
  useEffect(() => {
    if (!scanning) return;
    const video = videoRef.current;
    if (!video) return;
    const handler = () => { rafRef.current = requestAnimationFrame(scanFrame); };
    video.addEventListener("canplay", handler, { once: true });
    return () => { cancelAnimationFrame(rafRef.current); };
  }, [scanning, scanFrame]);

  useEffect(() => () => stopCamera(), []);

  return (
    <div className={compact ? "w-full" : "w-full max-w-sm"}>
      {/* Camera preview */}
      {scanning && (
        <div className="relative mb-4 rounded-2xl overflow-hidden bg-black aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scan frame overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 border-2 border-primary rounded-2xl opacity-80">
              {/* Corner marks */}
              {["top-0 left-0","top-0 right-0","bottom-0 left-0","bottom-0 right-0"].map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-5 h-5 border-primary border-2 rounded-sm`}
                  style={{
                    borderRight:  i % 2 === 0 ? "none" : undefined,
                    borderLeft:   i % 2 === 1 ? "none" : undefined,
                    borderBottom: i < 2 ? "none" : undefined,
                    borderTop:    i >= 2 ? "none" : undefined,
                  }}/>
              ))}
            </div>
          </div>

          <button
            onClick={stopCamera}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="absolute bottom-2 inset-x-0 text-center text-xs text-white/70">
            Point camera at QR code
          </p>
        </div>
      )}

      {/* Manual code entry */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
            placeholder="Access code — e.g. HKGEFEBQ"
            maxLength={20}
            autoComplete="off"
            spellCheck={false}
            className={`w-full rounded-xl border px-4 py-3 text-sm font-mono tracking-widest
              bg-white/10 dark:bg-white/8 backdrop-blur-md border-white/30 dark:border-white/15
              text-white placeholder:text-white/40 focus:outline-none focus:border-primary/80
              focus:ring-2 focus:ring-primary/30 transition-all
              ${compact ? "" : "bg-card text-foreground border-border placeholder:text-muted-foreground/50"}`}
          />
        </div>
        <button
          type="submit"
          disabled={!code.trim() || loading}
          className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-primary text-primary-foreground
            font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-all
            shadow-warm whitespace-nowrap"
        >
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <><span className="hidden sm:inline">Enter</span><ArrowRight className="h-4 w-4" /></>
          }
        </button>
      </form>

      {/* QR scan button */}
      {!scanning && (
        <button
          onClick={startCamera}
          className="mt-2.5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
            border border-white/20 dark:border-white/10 text-white/70 text-sm
            hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm"
        >
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
