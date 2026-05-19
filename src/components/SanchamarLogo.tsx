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
 * Sanchamar brand logo — transparent PNG, seamlessly blends with any background.
 */
export function SanchamarLogo({ variant = "mark", height = 32, className }: Props) {
  if (variant === "full") {
    // wordmark is approximately 5:1 aspect ratio
    const w = Math.round(height * 5.2);
    return (
      <Image
        src="/sanchamar-logo.png"
        alt="Sanchamar"
        width={w}
        height={height}
        className={cn("object-contain", className)}
        priority
      />
    );
  }

  return (
    <Image
      src="/sanchamar-s.png"
      alt="Sanchamar"
      width={height}
      height={height}
      className={cn("object-contain", className)}
      priority
    />
  );
}
