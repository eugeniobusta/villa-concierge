// Root layout: Next.js 16 requires <html> and <body> here.
// Font and CSS live here; locale-specific metadata lives in [locale]/layout.tsx.
// suppressHydrationWarning prevents false alarms from browser extensions
// that inject attributes (e.g. data-cursorstyle) into the <html> element.
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#FDFAF5]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
