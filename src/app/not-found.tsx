"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

// Pre-computed so SSR and client render the same DOM — no hydration mismatch.
const PARTICLES = [
  { id: 0,  w: 3, x: 8,  y: 22, dur: 5.2, delay: 0.0, op: 0.18 },
  { id: 1,  w: 2, x: 91, y: 47, dur: 3.8, delay: 0.6, op: 0.12 },
  { id: 2,  w: 4, x: 23, y: 73, dur: 6.1, delay: 1.2, op: 0.22 },
  { id: 3,  w: 2, x: 76, y: 15, dur: 4.5, delay: 0.3, op: 0.15 },
  { id: 4,  w: 3, x: 54, y: 88, dur: 5.8, delay: 1.8, op: 0.20 },
  { id: 5,  w: 2, x: 42, y: 35, dur: 3.4, delay: 2.1, op: 0.10 },
  { id: 6,  w: 4, x: 67, y: 62, dur: 7.0, delay: 0.9, op: 0.25 },
  { id: 7,  w: 2, x: 15, y: 55, dur: 4.2, delay: 1.5, op: 0.13 },
  { id: 8,  w: 3, x: 85, y: 80, dur: 5.5, delay: 0.4, op: 0.17 },
  { id: 9,  w: 2, x: 33, y: 10, dur: 3.9, delay: 2.8, op: 0.11 },
  { id: 10, w: 4, x: 72, y: 38, dur: 6.4, delay: 1.1, op: 0.23 },
  { id: 11, w: 2, x: 5,  y: 85, dur: 4.7, delay: 0.7, op: 0.14 },
  { id: 12, w: 3, x: 48, y: 18, dur: 5.0, delay: 2.4, op: 0.19 },
  { id: 13, w: 2, x: 92, y: 68, dur: 3.6, delay: 1.7, op: 0.12 },
  { id: 14, w: 4, x: 28, y: 92, dur: 6.8, delay: 0.2, op: 0.26 },
  { id: 15, w: 2, x: 61, y: 52, dur: 4.3, delay: 3.1, op: 0.16 },
  { id: 16, w: 3, x: 18, y: 40, dur: 5.6, delay: 1.0, op: 0.21 },
  { id: 17, w: 2, x: 80, y: 25, dur: 3.7, delay: 2.6, op: 0.13 },
  { id: 18, w: 4, x: 38, y: 65, dur: 6.3, delay: 0.5, op: 0.24 },
  { id: 19, w: 2, x: 55, y: 5,  dur: 4.8, delay: 1.9, op: 0.14 },
  { id: 20, w: 3, x: 95, y: 90, dur: 5.3, delay: 0.8, op: 0.18 },
  { id: 21, w: 2, x: 10, y: 60, dur: 3.5, delay: 2.0, op: 0.11 },
  { id: 22, w: 4, x: 44, y: 48, dur: 6.9, delay: 1.4, op: 0.22 },
  { id: 23, w: 2, x: 70, y: 95, dur: 4.1, delay: 3.3, op: 0.15 },
];

export default function NotFoundPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <style>{`
        /* ─── digit spring-in ─── */
        @keyframes nf-digit {
          0%   { opacity: 0; transform: scale(0.3) translateY(40px); }
          55%  { opacity: 1; transform: scale(1.10) translateY(-8px); }
          75%  { transform: scale(0.96) translateY(3px); }
          88%  { transform: scale(1.02) translateY(-1px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        /* ─── key bob ─── */
        @keyframes nf-key-bob {
          0%,100% { transform: translateY(0) rotate(-4deg); }
          50%     { transform: translateY(-18px) rotate(4deg); }
        }
        /* ─── outer ring slow spin ─── */
        @keyframes nf-spin-cw { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        /* ─── inner ring counter-spin ─── */
        @keyframes nf-spin-ccw { from { transform:rotate(0deg); } to { transform:rotate(-360deg); } }
        /* ─── glow pulse ─── */
        @keyframes nf-glow {
          0%,100% { opacity:.35; transform:scale(1); }
          50%     { opacity:.65; transform:scale(1.12); }
        }
        /* ─── particle float ─── */
        @keyframes nf-float {
          0%,100% { transform:translateY(0) translateX(0); }
          30%     { transform:translateY(-14px) translateX(6px); }
          65%     { transform:translateY(8px) translateX(-5px); }
        }
        /* ─── blob drift ─── */
        @keyframes nf-blob {
          0%,100% { transform:translate(0,0) scale(1); }
          33%     { transform:translate(28px,-18px) scale(1.05); }
          66%     { transform:translate(-18px,14px) scale(.96); }
        }
        /* ─── content fade-up ─── */
        @keyframes nf-fadeup {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        /* ─── dot trail under 404 ─── */
        @keyframes nf-dot-scale {
          0%,100% { transform:scaleY(1); opacity:.5; }
          50%     { transform:scaleY(1.8); opacity:1; }
        }

        .nf-digit {
          animation: nf-digit .65s cubic-bezier(.34,1.56,.64,1) both;
          opacity: 0;
        }
        .nf-key      { animation: nf-key-bob 5s ease-in-out infinite; }
        .nf-ring-cw  { animation: nf-spin-cw  24s linear infinite; transform-origin: center; }
        .nf-ring-ccw { animation: nf-spin-ccw 16s linear infinite; transform-origin: center; }
        .nf-glow     { animation: nf-glow 3.5s ease-in-out infinite; }
        .nf-particle { animation: nf-float ease-in-out infinite; }
        .nf-blob     { animation: nf-blob ease-in-out infinite; }
        .nf-content  { animation: nf-fadeup .6s ease-out both; opacity:0; }
        .nf-bar      { animation: nf-dot-scale 1.4s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-6 py-16">

        {/* ── Ambient gradient blobs ── */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="nf-blob absolute rounded-full blur-[120px]"
            style={{ width:720, height:720, background:"oklch(0.72 0.14 50 / 0.16)", top:"-18%", left:"22%", animationDuration:"20s" }} />
          <div className="nf-blob absolute rounded-full blur-[90px]"
            style={{ width:480, height:480, background:"oklch(0.62 0.11 190 / 0.11)", bottom:"-5%", right:"8%", animationDuration:"15s", animationDelay:"4s" }} />
          <div className="nf-blob absolute rounded-full blur-[70px]"
            style={{ width:320, height:320, background:"oklch(0.58 0.09 290 / 0.08)", top:"58%", left:"3%", animationDuration:"25s", animationDelay:"8s" }} />
        </div>

        {/* ── Floating particles ── */}
        {mounted && PARTICLES.map((p) => (
          <div key={p.id} className="nf-particle absolute rounded-full bg-primary pointer-events-none"
            style={{ width:p.w, height:p.w, left:`${p.x}%`, top:`${p.y}%`,
              opacity:p.op, animationDuration:`${p.dur}s`, animationDelay:`${p.delay}s` }} />
        ))}

        {/* ── Animated key icon ── */}
        <div className="nf-key mb-10 relative flex items-center justify-center" style={{ width:112, height:112 }}>
          {/* Pulsing glow orb */}
          <div className="nf-glow absolute inset-0 rounded-full"
            style={{ background:"oklch(0.72 0.16 50 / 0.40)", filter:"blur(24px)", transform:"scale(1.5)" }} />

          {/* Outer dashed ring — spins clockwise */}
          <svg viewBox="0 0 112 112" className="nf-ring-cw absolute inset-0 w-full h-full" fill="none">
            <circle cx="56" cy="56" r="52" stroke="currentColor" strokeWidth="1"
              className="text-primary" strokeOpacity=".25" strokeDasharray="6 5" />
            <circle cx="56" cy="56" r="44" stroke="currentColor" strokeWidth=".5"
              className="text-primary" strokeOpacity=".15" />
          </svg>

          {/* Inner dotted ring — spins counter-clockwise */}
          <svg viewBox="0 0 112 112" className="nf-ring-ccw absolute inset-0 w-full h-full" fill="none">
            <circle cx="56" cy="56" r="34" stroke="currentColor" strokeWidth="1"
              className="text-primary" strokeOpacity=".20" strokeDasharray="3 7" />
          </svg>

          {/* Key SVG */}
          <svg viewBox="0 0 56 56" className="relative z-10" width="56" height="56" fill="none">
            {/* Key bow (circle) */}
            <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="2.8" className="text-primary" />
            <circle cx="20" cy="20" r="5.5" fill="currentColor" className="text-primary" opacity=".45" />
            {/* Key shaft */}
            <line x1="30" y1="20" x2="50" y2="20" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" className="text-primary" />
            {/* First tooth */}
            <line x1="45" y1="20" x2="45" y2="27" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" className="text-primary" />
            {/* Second tooth */}
            <line x1="38" y1="20" x2="38" y2="25" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" className="text-primary" />
          </svg>
        </div>

        {/* ── 404 digits ── */}
        <div className="flex items-end gap-1 mb-2 select-none" aria-label="404 — Page not found">
          {"404".split("").map((char, i) => (
            <span key={i} className="nf-digit text-gradient font-black leading-none"
              style={{ fontSize:"clamp(96px, 20vw, 176px)", animationDelay:`${i * 0.13}s` }}>
              {char}
            </span>
          ))}
        </div>

        {/* Animated bar equaliser under 404 */}
        <div className="flex items-end gap-1 mb-10 h-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="nf-bar w-1 rounded-full bg-primary/30"
              style={{ height:`${8 + (i % 4) * 4}px`, animationDelay:`${i * 0.12}s`, animationDuration:"1.4s" }} />
          ))}
        </div>

        {/* ── Text content ── */}
        <div className="nf-content text-center max-w-md" style={{ animationDelay:"0.5s" }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 tracking-tight">
            This page has checked out
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-2">
            The page you&rsquo;re looking for doesn&rsquo;t exist, was moved, or the link has expired.
          </p>
          <p className="text-muted-foreground/70 text-sm leading-relaxed mb-10">
            If you arrived here from a guest link, it may be outside your stay dates.
            Contact your host for a new one.
          </p>

          {/* ── CTA buttons ── */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-warm hover:shadow-warm-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
            <button onClick={() => window.history.back()}
              className="flex items-center gap-2 px-6 py-3 bg-card text-foreground border border-border rounded-xl font-semibold text-sm hover:bg-secondary hover:-translate-y-0.5 transition-all duration-200 shadow-warm-sm">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>

          {/* Footer hint */}
          <p className="mt-10 text-xs text-muted-foreground/40 tracking-wider uppercase">
            Error 404 &nbsp;·&nbsp; Sanchamar · Malaga
          </p>
        </div>
      </div>
    </>
  );
}
