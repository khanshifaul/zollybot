"use client";

import {
  ANDROID_RELEASE_ASSET,
  DESKTOP_RELEASE_TARGETS,
  LATEST_RELEASE_URL,
  RELEASE_REPOSITORY_URL,
  releaseDownloadUrl,
} from "@zollybot/contracts/release-assets";
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Github,
  HardDrive,
  Monitor,
  Network,
  Shield,
  Smartphone,
  Terminal,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";

type Platform = "linux" | "macos" | "windows" | "android" | "ios" | "source";
type Arch = "x64" | "arm64" | "universal";

type DownloadItem = {
  id: string;
  platform: Platform;
  arch: Arch;
  format: string;
  note: string;
  recommended?: boolean;
  href: (version: string | null) => string;
};

const REPO = RELEASE_REPOSITORY_URL;
const RELEASES = `${REPO}/releases`;
const RELEASES_LATEST = LATEST_RELEASE_URL;
const INSTALL_CMD = "curl -fsSL https://raw.githubusercontent.com/khanshifaul/zollybot/main/site/install.sh | sh";

const PLATFORMS: { id: Platform; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "linux", label: "Linux", icon: Terminal },
  { id: "macos", label: "macOS", icon: Monitor },
  { id: "windows", label: "Windows", icon: Monitor },
  { id: "android", label: "Android", icon: Smartphone },
  { id: "ios", label: "iOS", icon: Smartphone },
  { id: "source", label: "Source", icon: Github },
];

function normalizeVersion(raw: string | null | undefined): string | null {
  const value = raw?.trim().replace(/^v/i, "");
  return value ? value : null;
}

function releaseAsset(version: string | null, asset: string): string {
  const parsed = normalizeVersion(version);
  return parsed ? releaseDownloadUrl(parsed, asset) : RELEASES_LATEST;
}

const DOWNLOADS: DownloadItem[] = [
  {
    id: "linux-appimage-x64",
    platform: "linux",
    arch: "x64",
    format: "AppImage",
    note: "Desktop GUI for most Linux distributions.",
    recommended: true,
    href: (v) => releaseAsset(v, DESKTOP_RELEASE_TARGETS["linux-x64"].artifact(normalizeVersion(v) ?? "latest")),
  },
  {
    id: "linux-appimage-arm64",
    platform: "linux",
    arch: "arm64",
    format: "AppImage",
    note: "Desktop GUI for arm64 Linux distributions.",
    href: (v) => releaseAsset(v, DESKTOP_RELEASE_TARGETS["linux-arm64"].artifact(normalizeVersion(v) ?? "latest")),
  },
  {
    id: "macos-arm64-dmg",
    platform: "macos",
    arch: "arm64",
    format: "DMG",
    note: "Apple silicon installer.",
    recommended: true,
    href: (v) =>
      releaseAsset(v, DESKTOP_RELEASE_TARGETS["macos-arm64"].extras?.(normalizeVersion(v) ?? "latest")[0] ?? ""),
  },
  {
    id: "macos-x64-installer",
    platform: "macos",
    arch: "x64",
    format: "Installer",
    note: "Intel Mac build, when the release publishes it.",
    href: () => RELEASES_LATEST,
  },
  {
    id: "windows-x64",
    platform: "windows",
    arch: "x64",
    format: "Installer",
    note: "Windows 10+ installer.",
    recommended: true,
    href: (v) => releaseAsset(v, DESKTOP_RELEASE_TARGETS["windows-x64"].artifact(normalizeVersion(v) ?? "latest")),
  },
  {
    id: "android-apk",
    platform: "android",
    arch: "arm64",
    format: "APK",
    note: "Connects to ZollyBot running on your computer.",
    recommended: true,
    href: (v) => releaseAsset(v, ANDROID_RELEASE_ASSET(normalizeVersion(v) ?? "latest")),
  },
  {
    id: "ios-release",
    platform: "ios",
    arch: "universal",
    format: "App build",
    note: "Mobile client for connecting to your desktop workspace.",
    recommended: true,
    href: () => RELEASES_LATEST,
  },
  {
    id: "source",
    platform: "source",
    arch: "universal",
    format: "Source code",
    note: "Clone or fork the repository and build locally.",
    recommended: true,
    href: () => REPO,
  },
];

function detectPlatform(): Exclude<Platform, "source"> {
  if (typeof navigator === "undefined") return "linux";
  const ua = navigator.userAgent || "";
  const platform = (navigator.platform || "").toLowerCase();
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua) || (platform.includes("mac") && navigator.maxTouchPoints > 1)) return "ios";
  if (/mac/i.test(platform) || /macintosh/i.test(ua)) return "macos";
  if (/win/i.test(platform) || /windows/i.test(ua)) return "windows";
  return "linux";
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2 shrink-0")}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : label}
    </button>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Card className="h-full border-border/70 bg-card/80 shadow-sm backdrop-blur">
      <CardHeader className="space-y-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm leading-6 text-muted-foreground">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function Page() {
  const [version, setVersion] = useState<string | null>(null);
  const [detected, setDetected] = useState<Platform>("linux");
  const [selected, setSelected] = useState<Platform>("linux");

  useEffect(() => {
    const platform = detectPlatform();
    setDetected(platform);
    setSelected(platform);

    let cancelled = false;
    const setSafe = (value: string | null) => {
      if (!cancelled) setVersion(value);
    };

    async function loadVersion() {
      try {
        const res = await fetch("https://api.github.com/repos/khanshifaul/zollybot/releases/latest", {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (res.ok) {
          const data = await res.json();
          const tag =
            typeof data === "object" && data !== null && "tag_name" in data && typeof data.tag_name === "string"
              ? data.tag_name
              : null;
          setSafe(normalizeVersion(tag));
          return;
        }
      } catch {
        // ignore
      }
      setSafe(null);
    }

    void loadVersion();
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo(() => DOWNLOADS.filter((item) => item.platform === selected), [selected]);
  const primary = options.find((item) => item.recommended) ?? options[0];
  const primaryHref = primary ? primary.href(version) : RELEASES_LATEST;
  const selectedMeta = PLATFORMS.find((item) => item.id === selected) ?? PLATFORMS[0];
  const SelectedIcon = selectedMeta.icon;

  return (
    <main className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.18),transparent),radial-gradient(ellipse_50%_40%_at_90%_10%,hsl(var(--primary)/0.10),transparent)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background))_70%)]"
        />
      </div>

      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container size="lg" className="flex h-14 items-center justify-between gap-3 sm:h-16 sm:gap-4">
          <a href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Image
              src="/brand/zollybot-logo.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 dark:hidden"
              priority
            />
            <Image
              src="/brand/zollybot-logo-dark.png"
              alt=""
              width={32}
              height={32}
              className="hidden h-8 w-8 dark:block"
              priority
            />
            <span>ZollyBot</span>
          </a>
          <nav className="flex items-center gap-1 sm:gap-2">
            <a
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
              href="#features"
            >
              Features
            </a>
            <a
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
              href="/marketplace"
            >
              Marketplace
            </a>
            <a className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "px-2.5 sm:px-3")} href="#download">
              Download
            </a>
            <ThemeToggle />
            <a className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2 px-2.5 sm:px-3")} href={REPO}>
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </nav>
        </Container>
      </header>

      <section className="pb-10 pt-12 sm:pb-16 sm:pt-24">
        <Container size="lg">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
              <Badge className="rounded-full px-3 py-1">Local-first</Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Multi-agent
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Offices = repos
              </Badge>
            </div>
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              A local-first workspace for
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {" "}
                AI agent teams
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm leading-7 text-muted-foreground sm:mt-6 sm:text-lg">
              Run Codex, Claude, Grok, and more from one desktop workspace. Your conversations, attachments, browser
              data, and app state stay in a local SQLite database on your machine.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <a
                className={cn(buttonVariants({ size: "lg" }), "h-11 w-full gap-2 px-5 sm:w-auto sm:px-6")}
                href={primaryHref}
              >
                <Download className="h-4 w-4" />
                Download for {selectedMeta.label}
              </a>
              <a
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 w-full gap-2 px-5 sm:w-auto sm:px-6",
                )}
                href="#download"
              >
                All platforms
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Detected:{" "}
              <strong className="font-medium text-foreground">
                {PLATFORMS.find((p) => p.id === detected)?.label ?? "Linux"}
              </strong>
              {version ? (
                <>
                  {" "}
                  · Latest release <code className="rounded bg-muted px-1.5 py-0.5 text-xs">v{version}</code>
                </>
              ) : (
                <>
                  {" "}
                  ·{" "}
                  <a className="text-primary underline underline-offset-4" href={RELEASES_LATEST}>
                    View latest release
                  </a>
                </>
              )}
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur">
              <p className="text-sm font-medium">Your data, local</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                SQLite-backed app state and workspace data stay on the computer running ZollyBot.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur">
              <p className="text-sm font-medium">Repo-first offices</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Each office maps to a repository path, keeping work organized around real projects.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur">
              <p className="text-sm font-medium">Provider flexibility</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Use multiple agent providers in one workspace while preserving context and identity.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section id="features" className="py-10 sm:py-14">
        <Container size="lg">
          <div className="mb-8 max-w-2xl">
            <Badge variant="outline" className="mb-3">
              Why ZollyBot
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Built for local, multi-agent work</h2>
            <p className="mt-3 text-muted-foreground">
              A practical desktop workspace for coordinating agents against real repositories without handing your
              project state to a hosted control plane.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={HardDrive}
              title="Local-first by design"
              description="Workspaces, conversations, attachments, browser data, and team data remain on your machine."
            />
            <Feature
              icon={Terminal}
              title="Offices from repos"
              description="Register an office from a repository path so agents work in the context of actual codebases."
            />
            <Feature
              icon={Network}
              title="Multi-provider workflow"
              description="Switch between providers and agents while keeping workspace, thread, and identity continuity."
            />
            <Feature
              icon={Shield}
              title="Transparent control"
              description="Network access is used for providers and visited pages; your core workspace state stays local."
            />
          </div>
        </Container>
      </section>

      <section id="download" className="scroll-mt-20 py-10 sm:py-14">
        <Container size="lg">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <Badge variant="outline" className="mb-3">
                Download
              </Badge>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Install ZollyBot</h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Choose your platform. Direct download links use the latest detected release when available.
              </p>
            </div>
            <a className={cn(buttonVariants({ variant: "outline" }), "w-full gap-2 sm:w-auto")} href={RELEASES}>
              Browse all releases
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <Card className="border-border/70 bg-card/80 shadow-sm lg:sticky lg:top-24 lg:h-fit">
              <CardHeader>
                <CardTitle className="text-base">Platform</CardTitle>
                <CardDescription>Select the build for your device.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  const active = platform.id === selected;
                  const isDetected = platform.id === detected;
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => setSelected(platform.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition",
                        active
                          ? "border-primary/40 bg-primary/10 text-foreground shadow-sm"
                          : "border-border/70 hover:border-border hover:bg-accent/50",
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{platform.label}</span>
                      </span>
                      {isDetected ? (
                        <Badge variant={active ? "default" : "secondary"} className="text-[10px]">
                          Detected
                        </Badge>
                      ) : null}
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="border-border/70 bg-card/80 shadow-sm">
                <CardHeader className="gap-2">
                  <div className="flex items-center gap-2">
                    <SelectedIcon className="h-5 w-5 text-primary" />
                    <CardTitle>{selectedMeta.label} downloads</CardTitle>
                  </div>
                  <CardDescription>
                    {selected === "linux"
                      ? "Recommended: AppImage for most distributions. Install script verifies checksums."
                      : selected === "macos" || selected === "windows"
                        ? "Desktop installers are published on GitHub Releases."
                        : selected === "android" || selected === "ios"
                          ? "Mobile clients connect to ZollyBot running on your computer."
                          : "Source code, issues, and build instructions."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {options.map((item) => {
                    const href = item.href(version);
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
                          item.recommended ? "border-primary/30 bg-primary/[0.03]" : "border-border/70",
                        )}
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={href}
                              className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                            >
                              {item.format}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </a>
                            <Badge variant="outline">{item.arch}</Badge>
                            {item.recommended ? <Badge>Recommended</Badge> : null}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.note}
                            {version && href.includes(version) ? ` · v${version}` : ""}
                          </p>
                        </div>
                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0">
                          <a className={cn(buttonVariants({ size: "sm" }), "w-full gap-2 sm:w-auto")} href={href}>
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                          <CopyButton text={href} label="Copy link" />
                        </div>
                      </div>
                    );
                  })}
                  {!version &&
                  selected !== "source" &&
                  selected !== "macos" &&
                  selected !== "windows" &&
                  selected !== "ios" ? (
                    <p className="text-sm text-muted-foreground">
                      Couldn&apos;t detect the latest version automatically. Links fall back to{" "}
                      <a className="text-primary underline underline-offset-4" href={RELEASES_LATEST}>
                        GitHub Releases
                      </a>
                      .
                    </p>
                  ) : null}
                </CardContent>
              </Card>

              {selected === "linux" ? (
                <Card id="install" className="border-border/70 bg-card/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Terminal className="h-4 w-4 text-primary" />
                      Install via script
                    </CardTitle>
                    <CardDescription>
                      Installs binaries into <code className="rounded bg-muted px-1 py-0.5">~/.local/bin</code> and
                      verifies checksums.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3 rounded-xl border bg-muted/50 p-3 sm:flex-row sm:items-start">
                      <pre className="min-w-0 flex-1 overflow-x-auto rounded-md font-mono text-xs leading-6 sm:text-sm">
                        <code>{INSTALL_CMD}</code>
                      </pre>
                      <div className="sm:shrink-0">
                        <CopyButton text={INSTALL_CMD} />
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        Run <code className="rounded bg-muted px-1 py-0.5 text-foreground">zollybot</code> for the GUI
                        or <code className="rounded bg-muted px-1 py-0.5 text-foreground">zollybot-cli</code> for the
                        terminal client.
                      </li>
                      <li className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        Review the script before running:{" "}
                        <a
                          className="text-primary underline underline-offset-4"
                          href="https://raw.githubusercontent.com/khanshifaul/zollybot/main/site/install.sh"
                        >
                          install.sh
                        </a>
                        .
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container size="lg">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="border-border/70 bg-card/80 shadow-sm">
              <CardHeader>
                <CardTitle>How it fits together</CardTitle>
                <CardDescription>Repo-first offices, local control.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>
                  <strong className="font-medium text-foreground">Office = repo.</strong> Each office is registered from
                  a repository path.
                </p>
                <p>
                  <strong className="font-medium text-foreground">Local source of truth.</strong> App state is stored in
                  SQLite. Agents can keep workspace, thread, and identity context across provider switches.
                </p>
                <p>
                  <strong className="font-medium text-foreground">Local-first data.</strong> Workspaces, conversations,
                  attachments, browser data, and team data stay on the computer that runs ZollyBot.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/80 shadow-sm">
              <CardHeader>
                <CardTitle>Release targets</CardTitle>
                <CardDescription>Current platform availability.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  { name: "Linux x86_64", status: "Supported", variant: "default" as const },
                  { name: "Android arm64", status: "Supported", variant: "default" as const },
                  { name: "macOS", status: "Installer / releases", variant: "secondary" as const },
                  { name: "Windows", status: "Installer / releases", variant: "secondary" as const },
                  { name: "iOS", status: "Mobile client", variant: "secondary" as const },
                ].map((row, i, arr) => (
                  <div
                    key={row.name}
                    className={cn(
                      "flex items-center justify-between pb-3",
                      i < arr.length - 1 ? "border-b border-border/70" : "pb-0",
                    )}
                  >
                    <span className="text-foreground">{row.name}</span>
                    <Badge variant={row.variant}>{row.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      <Separator className="opacity-60" />
      <footer className="py-8">
        <Container
          size="lg"
          className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
        >
          <p>ZollyBot — local-first multi-agent desktop workspace.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a className="hover:text-foreground" href={RELEASES}>
              Releases
            </a>
            <a className="hover:text-foreground" href={REPO}>
              GitHub
            </a>
            <a className="hover:text-foreground" href={`${REPO}#readme`}>
              README
            </a>
          </div>
        </Container>
      </footer>
    </main>
  );
}
