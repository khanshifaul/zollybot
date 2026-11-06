export const EXTERNAL_LINK_REL = "noopener noreferrer";

/** The installer each platform's download button starts: Apple silicon on macOS, x64 elsewhere. */
export const ZOLLYBOT_DOWNLOAD_LINKS = {
  macos: "/download/macos/latest",
  windows: "/download/windows/latest",
  linux: "/download/linux/latest",
} as const;

/** The other installer of a platform that ships two architectures. Windows ships x64 only. */
export const ZOLLYBOT_ALTERNATE_DOWNLOAD_LINKS = {
  macos: "/download/macos/latest?arch=x64",
  linux: "/download/linux/latest?arch=arm64",
} as const;

/** The pages that describe each installer: requirements, install steps and known limits. */
export const ZOLLYBOT_DOWNLOAD_PAGE_LINKS = {
  hub: "/download",
  macos: "/download/macos",
  windows: "/download/windows",
  linux: "/download/linux",
  ios: "/download/ios",
  android: "/download/android",
} as const;

export const ZOLLYBOT_LINKS = {
  /** The contact form page. */
  contact: "/contact",
  x: "https://x.com/ZollyBot_",
  /** A Redirect Rule in the zollybot.shifaul.dev Cloudflare zone sends this to the current Discord invite. */
  discord: "https://discord.zollybot.shifaul.dev",
  download: "#download",
  news: "/news",
  guides: "/guides",
  marketplace: "/marketplace",
  changelog: "/changelog",
  releases: "https://github.com/khanshifaul/zollybot/releases",
  repository: "https://github.com/khanshifaul/zollybot",
  license: "https://github.com/khanshifaul/zollybot/blob/main/LICENSE",
  privacy: "https://github.com/khanshifaul/zollybot/blob/main/PRIVACY.md",
  documentation: "https://github.com/khanshifaul/zollybot#readme",
  troubleshooting: "https://github.com/khanshifaul/zollybot/blob/main/docs/TROUBLESHOOTING.md",
  /** GitHub Pages hosts the status page, so it stays up when Cloudflare does not. */
  status: "https://status.zollybot.shifaul.dev",
  selfHostedServer: "https://github.com/khanshifaul/zollybot/blob/main/docs/self-hosted-server.md",
  dockerDocumentation: "https://github.com/khanshifaul/zollybot/blob/main/docs/docker.md",
  dockerInstallUbuntu: "https://docs.docker.com/engine/install/ubuntu/",
  architecture: "https://github.com/khanshifaul/zollybot#architecture",
  contributing: "https://github.com/khanshifaul/zollybot/blob/main/CONTRIBUTING.md",
  codex: "https://learn.chatgpt.com/docs/app-server",
  claude: "https://code.claude.com/docs/en/overview",
  anthropicAgents: "https://www.anthropic.com/engineering/building-effective-agents",
} as const;

/**
 * One entry in a footer column. An internal entry carries a route, not a string,
 * so the footer can render it as a client navigation. It also fixes a link that
 * only worked on one page: "#download" on its own finds nothing on /news, because
 * there is no download section there for it to scroll to.
 */
export type FooterLink =
  | { readonly label: string; readonly external: true; readonly href: string }
  | {
      readonly label: string;
      readonly external: false;
      readonly to:
        | "/"
        | "/download"
        | "/news"
        | "/guides"
        | "/marketplace"
        | "/changelog"
        | "/compare"
        | "/providers"
        | "/teams"
        | "/pricing"
        | "/brand"
        | "/contact"
        | "/privacy-policy"
        | "/terms"
        | "/commercial-license"
        | "/dpa"
        | "/cla";
      readonly hash?: string;
    }
  | {
      readonly label: string;
      readonly external: false;
      readonly to: "/compare/$slug" | "/providers/$slug";
      readonly slug: string;
    };

export interface FooterColumn {
  readonly title: string;
  readonly links: readonly FooterLink[];
}

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Download", external: false, to: "/download" },
      { label: "News", external: false, to: "/news" },
      { label: "Guides", external: false, to: "/guides" },
      { label: "Marketplace", external: false, to: "/marketplace" },
      { label: "Changelog", external: false, to: "/changelog" },
      { label: "Teams", external: false, to: "/teams" },
      { label: "Pricing", external: false, to: "/pricing" },
      { label: "Contact", external: false, to: "/contact" },
      { label: "Brand", external: false, to: "/brand" },
      { label: "Source code", external: true, href: ZOLLYBOT_LINKS.repository },
      { label: "License", external: true, href: ZOLLYBOT_LINKS.license },
      { label: "Privacy policy", external: false, to: "/privacy-policy" },
      { label: "Terms", external: false, to: "/terms" },
      { label: "Commercial license", external: false, to: "/commercial-license" },
      { label: "DPA", external: false, to: "/dpa" },
      { label: "CLA", external: false, to: "/cla" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", external: true, href: ZOLLYBOT_LINKS.documentation },
      { label: "Troubleshooting", external: true, href: ZOLLYBOT_LINKS.troubleshooting },
      { label: "Status", external: true, href: ZOLLYBOT_LINKS.status },
      { label: "Self-hosted server", external: true, href: ZOLLYBOT_LINKS.selfHostedServer },
      { label: "Architecture", external: true, href: ZOLLYBOT_LINKS.architecture },
      { label: "Contributing", external: true, href: ZOLLYBOT_LINKS.contributing },
      { label: "Codex", external: true, href: ZOLLYBOT_LINKS.codex },
      { label: "Claude Code", external: true, href: ZOLLYBOT_LINKS.claude },
      { label: "Discord", external: true, href: ZOLLYBOT_LINKS.discord },
    ],
  },
  {
    title: "Providers",
    links: [
      { label: "Claude Code", external: false, to: "/providers/$slug", slug: "claude-code" },
      { label: "Codex", external: false, to: "/providers/$slug", slug: "codex" },
      { label: "Gemini", external: false, to: "/providers/$slug", slug: "gemini" },
      { label: "Grok", external: false, to: "/providers/$slug", slug: "grok" },
      { label: "Cursor", external: false, to: "/providers/$slug", slug: "cursor" },
      { label: "OpenCode", external: false, to: "/providers/$slug", slug: "opencode" },
      { label: "Cline", external: false, to: "/providers/$slug", slug: "cline" },
      { label: "Ollama and LM Studio", external: false, to: "/providers/$slug", slug: "local-models" },
      { label: "All providers", external: false, to: "/providers" },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "ZollyBot vs Grok Bot", external: false, to: "/compare/$slug", slug: "grok-bot" },
      { label: "ZollyBot vs Hermes Agent", external: false, to: "/compare/$slug", slug: "hermes-agent" },
      { label: "ZollyBot vs Muse", external: false, to: "/compare/$slug", slug: "muse" },
      { label: "ZollyBot vs OpenClaw", external: false, to: "/compare/$slug", slug: "openclaw" },
      { label: "ZollyBot vs Claude Cowork", external: false, to: "/compare/$slug", slug: "claude-cowork" },
      { label: "ZollyBot vs ChatGPT dots", external: false, to: "/compare/$slug", slug: "chatgpt-dots" },
      { label: "ZollyBot vs Manus", external: false, to: "/compare/$slug", slug: "manus" },
      { label: "ZollyBot vs Devin", external: false, to: "/compare/$slug", slug: "devin" },
      { label: "ZollyBot vs Paperclip", external: false, to: "/compare/$slug", slug: "paperclip" },
      { label: "ZollyBot vs Viktor", external: false, to: "/compare/$slug", slug: "viktor" },
      { label: "ZollyBot vs Instinct", external: false, to: "/compare/$slug", slug: "instinct" },
      { label: "Best AI agent apps", external: false, to: "/compare/$slug", slug: "best-ai-agent-apps" },
      { label: "All comparisons", external: false, to: "/compare" },
    ],
  },
];
