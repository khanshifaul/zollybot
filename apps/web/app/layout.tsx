import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "ZollyBot — local-first multi-agent workspace",
  description:
    "A local-first desktop workspace for Codex, Claude, Grok, and more. Repo-first offices, SQLite-backed state, and multi-provider workflows on your machine.",
  applicationName: "ZollyBot",
  keywords: ["ZollyBot", "AI agents", "local-first", "desktop workspace", "Codex", "Claude", "Grok", "SQLite"],
  openGraph: {
    title: "ZollyBot — local-first multi-agent workspace",
    description:
      "One local-first workspace for Codex, Claude, Grok, and more. Offices map to repos and your data stays on your machine.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZollyBot — local-first multi-agent workspace",
    description:
      "One local-first workspace for Codex, Claude, Grok, and more. Offices map to repos and your data stays on your machine.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7faff" },
    { media: "(prefers-color-scheme: dark)", color: "#070b14" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
