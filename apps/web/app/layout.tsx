import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";

const DESCRIPTION =
  "One local-first workspace for Codex, Claude, Grok, and more. Offices map to repos and your data stays on your machine.";

export const metadata: Metadata = {
  metadataBase: new URL("https://zollybot.vercel.app"),
  title: "ZollyBot — local-first multi-agent workspace",
  description: DESCRIPTION,
  applicationName: "ZollyBot",
  keywords: ["ZollyBot", "AI agents", "local-first", "desktop workspace", "Codex", "Claude", "Grok", "SQLite"],
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "ZollyBot — local-first multi-agent workspace",
    description: DESCRIPTION,
    type: "website",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "ZollyBot" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZollyBot — local-first multi-agent workspace",
    description: DESCRIPTION,
    images: ["/opengraph-image.png"],
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
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
