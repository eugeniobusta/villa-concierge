import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  /** "mark" = just the S monogram, "full" = full Sanchamar wordmark */
  variant?: "mark" | "full";
  className?: string;
  /** Height in px (width scales proportionally) */
  height?: number;
}

/**
 * Sanchamar brand logo.
 * The JPG assets have a white background — we wrap them in a white pill so
 * they look intentional in both light and dark mode.
 */
export function SanchamarLogo({ variant = "mark", height = 32, className }: Props) {
  if (variant === "full") {
    // wordmark is ~5:1 aspect ratio
    const w = Math.round(height * 5);
    return (
      <div className={cn("bg-white rounded-lg px-2.5 py-1 shadow-warm-sm inline-flex", className)}>
        <Image
          src="/sanchamar-logo.jpg"
          alt="Sanchamar"
          width={w}
          height={height}
          className="object-contain"
          priority
        />
      </div>
    );
  }

  // monogram is ~1:1
  return (
    <div
      className={cn("bg-white rounded-xl shadow-warm-sm inline-flex items-center justify-center overflow-hidden", className)}
      style={{ width: height, height }}
    >
      <Image
        src="/sanchamar-s.jpg"
        alt="Sanchamar"
        width={height}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  );
}
