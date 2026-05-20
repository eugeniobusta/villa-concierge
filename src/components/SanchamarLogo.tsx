import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  /** "mark" = just the S monogram, "full" = full Sanchamar wordmark */
  variant?: "mark" | "full";
  className?: string;
  /** Height in px (width scales proportionally) */
  height?: number;
}

// SVG aspect ratios from the traced files (viewBox dimensions)
const MARK_RATIO = 723 / 579;  // 1.248
const FULL_RATIO = 1598 / 390; // 4.098

export function SanchamarLogo({ variant = "mark", height = 32, className }: Props) {
  if (variant === "full") {
    const w = Math.round(height * FULL_RATIO);
    return (
      <Image
        src="/sanchamar-logo.svg"
        alt="Sanchamar"
        width={w}
        height={height}
        className={cn("object-contain", className)}
        priority
        unoptimized
      />
    );
  }

  const w = Math.round(height * MARK_RATIO);
  return (
    <Image
      src="/sanchamar-s.svg"
      alt="Sanchamar"
      width={w}
      height={height}
      className={cn("object-contain", className)}
      priority
      unoptimized
    />
  );
}
