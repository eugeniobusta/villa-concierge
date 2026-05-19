export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Locale-specific html/body tags are handled in [locale]/layout.tsx
  return children;
}
