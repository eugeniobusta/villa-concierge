"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { QrCode, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  url:      string;
  guestName: string;
}

export default function DownloadQrButton({ url, guestName }: Props) {
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width:          512,
        margin:         2,
        color: {
          dark:  "#0e1826", // Sanchamar navy
          light: "#ffffff",
        },
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `sanchamar-qr-${guestName.replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={download} disabled={loading}>
      {loading
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <QrCode className="h-3.5 w-3.5" />
      }
      {loading ? "Generating…" : "Download QR"}
    </Button>
  );
}
