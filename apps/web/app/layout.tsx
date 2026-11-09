import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZollyBot — local-first multi-agent workspace",
  description: "Local-first multi-agent desktop workspace. Offices are repos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
