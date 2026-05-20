"use client";

import { Download } from "lucide-react";

interface Props {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  disabled?: boolean;
}

export function ExportCsvButton({ filename, headers, rows, disabled }: Props) {
  function download() {
    const escape = (v: string | number) => {
      const s = String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };
    const csv = [headers, ...rows]
      .map((row) => row.map(escape).join(","))
      .join("\n");
    // BOM ensures Excel opens UTF-8 correctly
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      disabled={disabled}
      className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </button>
  );
}
