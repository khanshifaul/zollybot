"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type Platform = "linux" | "macos" | "windows" | "android" | "ios" | "source";
type Arch = "x64" | "arm64" | "universal";

type Download = {
  id: string;
  platform: Platform;
  label: string;
  arch: Arch;
  format: string;
  note: string;
  href: (v: string) => string;
  available: (v: string | null) => boolean;
};

const RELEASES = "https://github.com/khanshifaul/zollybot/releases";
const INSTALL_CMD = "curl -fsSL https://zollybot.shifaul.dev/install.sh | sh";

const DOWNLOADS: Download[] = [
  {
    id: "linux-x64-appimage",
    platform: "linux",
    label: "Linux",
    arch: "x64",
    format: "AppImage",
    note: "Desktop GUI · most Linux distributions",
    href: (v) => `${RELEASES}/download/${v}/zollybot-gui-${v}-x86_64.AppImage`,
    available: (v) => !!v,
  },
  {
    id: "linux-x64-tar",
    platform: "linux",
    label: "Linux",
    arch: "x64",
    format: "tar.gz",
    note: "Portable archive · used by install.sh",
    href: (v) => `${RELEASES}/download/${v}/zollybot-linux-x86_64-${v}.tar.gz`,
    available: (v) => !!v,
  },
  {
    id: "linux-cli",
    platform: "linux",
    label: "Linux CLI",
    arch: "x64",
    format: "binary",
    note: "zollybot-cli · TUI and control-socket client",
    href: (v) => `${RELEASES}/download/${v}/zollybot-cli-linux-x86_64-${v}`,
    available: (v) => !!v,
  },
  {
    id: "macos-dmg",
    platform: "macos",
    label: "macOS",
    arch: "universal",
    format: "DMG",
    note: "macOS 13+ · Apple silicon and Intel",
    href: () => "/download/macos/latest",
    available: () => true,
  },
  {
    id: "windows-exe",
    platform: "windows",
    label: "Windows",
    arch: "x64",
    format: "installer",
    note: "Windows 10+ · x64",
    href: () => "/download/windows/latest",
    available: () => true,
  },
  {
    id: "android-apk",
    platform: "android",
    label: "Android",
    arch: "arm64",
    format: "APK",
    note: "Connects to ZollyBot on your computer",
    href: (v) => `${RELEASES}/download/${v}/zollybot-android-arm64-${v}.apk`,
    available: (v) => !!v,
  },
  {
    id: "ios",
    platform: "ios",
    label: "iPhone / iPad",
    arch: "universal",
    format: "App Store",
    note: "Connects to ZollyBot on your computer",
    href: () => "/download/ios",
    available: () => true,
  },
  {
    id: "source",
    platform: "source",
    label: "Source",
    arch: "universal",
    format: "GitHub",
    note: "Build from source · PolyForm Noncommercial 1.0.0",
    href: () => "https://github.com/khanshifaul/zollybot",
    available: () => true,
  },
];

const PLATFORM_LABEL: Record<Platform, string> = {
  linux: "Linux",
  macos: "macOS",
  windows: "Windows",
  android: "Android",
  ios: "iOS",
  source: "Source",
};

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "linux";
  const ua = navigator.userAgent || "";
  const p = (navigator.platform || "").toLowerCase();
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua) || (p.includes("mac") && navigator.maxTouchPoints > 1)) return "ios";
  if (/mac/i.test(p) || /macintosh/i.test(ua)) return "macos";
  if (/win/i.test(p) || /windows/i.test(ua)) return "windows";
  if (/linux/i.test(p) || /linux/i.test(ua)) return "linux";
  return "linux";
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "absolute";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }
      }}
    >
      {copied ? "Copied" : label}
    </button>
  );
}

export default function Page() {
  const [version, setVersion] = useState<string | null>(null);
  const [detected, setDetected] = useState<Platform>("linux");
  const [selected, setSelected] = useState<Platform>("linux");

  useEffect(() => {
    const p = detectPlatform();
    setDetected(p);
    setSelected(p);
    fetch("/latest")
      .then((r) => r.text())
      .then((v) => setVersion(v.trim() || null))
      .catch(() => setVersion(null));
  }, []);

  const platforms = useMemo(() => (["linux", "macos", "windows", "android", "ios", "source"] as Platform[]), []);
  const visible = useMemo(() => DOWNLOADS.filter((d) => d.platform === selected && d.available(version)), [selected, version]);
  const primary = visible[0] ?? DOWNLOADS.find((d) => d.platform === selected);
  const installCmd = selected === "linux" ? INSTALL_CMD : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Container size="lg" className="py-14 sm:py-20">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>local-first</Badge>
          <Badge variant="secondary">multi-agent</Badge>
          <Badge variant="outline">offices = repos</Badge>
        </div>

        <Text as="h1" variant="h1" className="mt-5 max-w-3xl">
          ZollyBot
        </Text>
        <Text variant="lead" className="mt-4 max-w-2xl">
          One local-first workspace for Codex, Claude, Grok, and more. Your data stays in your SQLite database. Providers and visited pages can use the network.
        </Text>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {primary ? (
            <a className={cn(buttonVariants({ size: "lg" }))} href={primary.href(version || "")}>
              Download for {PLATFORM_LABEL[selected]}
            </a>
          ) : null}
          <a className={cn(buttonVariants({ variant: "outline", size: "lg" }))} href="#download">All downloads</a>
          <a className={cn(buttonVariants({ variant: "ghost", size: "lg" }))} href="https://github.com/khanshifaul/zollybot">GitHub</a>
        </div>
        <Text variant="muted" className="mt-3">
          Detected: <strong>{PLATFORM_LABEL[detected]}</strong>. You can change the platform below.
          {version ? <> Latest: <code>{version}</code>.</> : null}
        </Text>

        <Separator className="my-10" />

        <section id="download" className="scroll-mt-8">
          <Text as="h2" variant="h2">Download</Text>
          <Text variant="muted" className="mt-2">Choose your platform. The recommended option is selected for your device; change it if you need another build.</Text>

          <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Platform">
            {platforms.map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={selected === p}
                className={cn(
                  buttonVariants({ variant: selected === p ? "default" : "outline", size: "sm" }),
                  detected === p && selected !== p ? "ring-1 ring-ring" : "",
                )}
                onClick={() => setSelected(p)}
              >
                {PLATFORM_LABEL[p]}
                {detected === p ? " (this device)" : ""}
              </button>
            ))}
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>{PLATFORM_LABEL[selected]} downloads</CardTitle>
              <CardDescription>
                {selected === "linux" ? "Linux x86_64 builds. The install script verifies checksums." : selected === "macos" || selected === "windows" ? "Installer links resolve to the latest GitHub release." : selected === "android" || selected === "ios" ? "Mobile app connects to ZollyBot running on your computer." : "Source code and build instructions."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {visible.length ? visible.map((d) => (
                <div key={d.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <a className="font-medium text-primary underline underline-offset-4" href={d.href(version || "")}>{d.format}</a>
                      <Badge variant="outline">{d.arch}</Badge>
                      {d.id === primary?.id ? <Badge>Recommended</Badge> : null}
                    </div>
                    <Text variant="muted" className="!mt-1">{d.note}{version && d.href(version).includes(version) ? ` · ${version}` : ""}</Text>
                  </div>
                  <CopyButton text={d.href(version || "")} label="Copy link" />
                </div>
              )) : (
                <Text variant="muted">No direct download is listed for this platform yet. Use <a className="text-primary underline" href={RELEASES}>GitHub releases</a> or build from source.</Text>
              )}
            </CardContent>
          </Card>

          {installCmd ? (
            <Card className="mt-4" id="install">
              <CardHeader>
                <CardTitle>Install command (Linux)</CardTitle>
                <CardDescription>Installs binaries into <code>~/.local/bin</code> and verifies the release checksum.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2 rounded-lg border bg-muted p-3">
                  <pre className="min-w-0 flex-1 overflow-x-auto font-mono text-sm"><code>{installCmd}</code></pre>
                  <CopyButton text={installCmd} label="Copy" />
                </div>
                <Text variant="muted" className="mt-3">After install, run <code>zollybot</code> (GUI) or <code>zollybot-cli</code> (CLI and TUI control-socket client).</Text>
              </CardContent>
            </Card>
          ) : selected === "macos" || selected === "windows" ? (
            <Card className="mt-4" id="install">
              <CardHeader>
                <CardTitle>Install</CardTitle>
                <CardDescription>Download the installer and open it. {selected === "macos" ? "macOS may ask you to confirm the app in System Settings." : "Windows may show a SmartScreen prompt for a new release."}</CardDescription>
              </CardHeader>
              <CardContent>
                <Text variant="muted">For advanced/manual install, use <a className="text-primary underline" href={RELEASES}>GitHub releases</a>.</Text>
              </CardContent>
            </Card>
          ) : null}
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>How it fits together</CardTitle>
              <CardDescription>Repo-first offices, local control.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Office = repo.</strong> Each office is registered from a repository path.</p>
              <p><strong>Files are the truth.</strong> SQLite is the source of truth for app state. Agents keep workspace, thread, and identity across provider switches.</p>
              <p><strong>Local first.</strong> Workspaces, conversations, attachments, browser data, and team data stay on the computer that runs ZollyBot.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Platforms</CardTitle>
              <CardDescription>Current release targets.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between border-b pb-2"><span>Linux x86_64</span><Badge>Supported</Badge></div>
                <div className="flex items-center justify-between border-b pb-2"><span>Android arm64</span><Badge>Supported</Badge></div>
                <div className="flex items-center justify-between border-b pb-2"><span>macOS</span><Badge variant="secondary">Installer / releases</Badge></div>
                <div className="flex items-center justify-between"><span>Windows</span><Badge variant="secondary">Installer / releases</Badge></div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />
        <Text variant="muted">UI: Next.js, Tailwind CSS, and <a className="text-primary underline underline-offset-4" href="https://www.npmjs.com/package/@srcroot/ui">@srcroot/ui</a> components. Download patterns inspired by VS Code and OpenBot.</Text>
      </Container>
    </main>
  );
}
