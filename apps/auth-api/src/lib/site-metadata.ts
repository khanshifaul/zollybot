// No Vite-only import belongs in this file. `vite.config.ts` reads it, through the
// news artwork generator, while plain Node loads the config, and Node cannot
// resolve an `?url` specifier. That is why the font asset arrives as an argument
// from the root route instead of as an import here.

import { LANDING_FAQ_STRUCTURED_DATA } from "./landing-faq";
import { ZOLLYBOT_ALTERNATE_DOWNLOAD_LINKS, ZOLLYBOT_DOWNLOAD_LINKS } from "./landing-links";

export const ZOLLYBOT_SITE_URL = "https://openbot.run/";
export const ZOLLYBOT_SITE_TITLE = "ZollyBot: Run a team of AI agents on your computer";
export const ZOLLYBOT_SITE_DESCRIPTION =
  "A free desktop app that runs AI agents as a team on your own computer, with the ChatGPT, Claude, Gemini or Grok plan you already pay for, or your own model.";
export const ZOLLYBOT_SOCIAL_IMAGE_URL = `${ZOLLYBOT_SITE_URL}zollybot-social.png`;
/** The account `ZOLLYBOT_LINKS.x` opens, which a shared card names. */
export const ZOLLYBOT_X_HANDLE = "@ZollyBot_";
const ZOLLYBOT_X_URL = "https://x.com/ZollyBot_";
const ZOLLYBOT_REPOSITORY_URL = "https://github.com/nightly-labs/openbot";
const ZOLLYBOT_PRODUCT_HUNT_URL = "https://www.producthunt.com/products/zollybot-3";
const ZOLLYBOT_LICENSE_URL = "https://polyformproject.org/licenses/noncommercial/1.0.0/";
// One id for each entity, so that every page describes the same organization,
// site and app, and an assistant can join what the pages say about each.
const ZOLLYBOT_ORGANIZATION_ID = `${ZOLLYBOT_SITE_URL}#organization`;
const ZOLLYBOT_WEBSITE_ID = `${ZOLLYBOT_SITE_URL}#website`;
const ZOLLYBOT_APPLICATION_ID = `${ZOLLYBOT_SITE_URL}#app`;
/** Square, as schema.org wants for a publisher logo. */
export const ZOLLYBOT_LOGO_URL = `${ZOLLYBOT_SITE_URL}icon-512x512.png`;
export const ZOLLYBOT_SOCIAL_IMAGE_ALT = "Meet ZollyBot on a dark grid background";

/** The Open Graph tags of the site's own social card, which is 1600x900. */
export const ZOLLYBOT_SOCIAL_IMAGE_META = [
  { property: "og:image", content: ZOLLYBOT_SOCIAL_IMAGE_URL },
  { property: "og:image:type", content: "image/png" },
  { property: "og:image:width", content: "1600" },
  { property: "og:image:height", content: "900" },
  { property: "og:image:alt", content: ZOLLYBOT_SOCIAL_IMAGE_ALT },
] as const;

/** The site's card in the shape of `pageSocialImageMeta`, for a page that can have either. */
export const ZOLLYBOT_SOCIAL_IMAGE_TAGS = {
  openGraph: ZOLLYBOT_SOCIAL_IMAGE_META,
  twitter: [
    { name: "twitter:image", content: ZOLLYBOT_SOCIAL_IMAGE_URL },
    { name: "twitter:image:alt", content: ZOLLYBOT_SOCIAL_IMAGE_ALT },
  ],
} as const;

/** A page's own social card: a 1600x900 JPEG in `public/social/`, the size of the site's card. */
export interface PageSocialImage {
  /** The path from the site root, for example `/social/teams.jpg`. */
  path: string;
  alt: string;
}

/** The card of the terms, the privacy policy and the DPA. */
export const ZOLLYBOT_LEGAL_SOCIAL_IMAGE: PageSocialImage = {
  path: "/social/legal.jpg",
  alt: "Plain terms. No surprises. ZollyBot agents beside a paper map",
};

/**
 * The Open Graph and X tags of a page's own social card. The image URL uses the site that
 * serves the page, so a pull-request preview names an image that it has.
 */
export function pageSocialImageMeta(image: PageSocialImage, siteUrl: string) {
  const url = new URL(image.path, siteUrl).toString();
  return {
    openGraph: [
      { property: "og:image", content: url },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1600" },
      { property: "og:image:height", content: "900" },
      { property: "og:image:alt", content: image.alt },
    ],
    twitter: [
      { name: "twitter:image", content: url },
      { name: "twitter:image:alt", content: image.alt },
    ],
  } as const;
}

// The hosts production answers on. Both serve the same pages, and those pages go by
// openbot.run.
const ZOLLYBOT_PRODUCTION_HOSTS = new Set(["openbot.run", "api.openbot.run"]);

/**
 * The site that the head tags of a page served at `pageUrl` name. Social sites fetch
 * `og:url` and `og:image` themselves and show no card when those answer 404. A
 * pull-request preview serves pages and images that openbot.run does not have yet,
 * so any host other than production names itself. Cloudflare marks preview URLs
 * `noindex`, so a preview canonical does not compete with production.
 */
export function siteUrlForPage(pageUrl: URL): string {
  return ZOLLYBOT_PRODUCTION_HOSTS.has(pageUrl.hostname) ? ZOLLYBOT_SITE_URL : `${pageUrl.origin}/`;
}

/** What the app's structured data names and that this file can not import: see the note at the top. */
export interface ZollyBotApplicationFacts {
  /** The version of the newest release. */
  version: string;
  /** An absolute URL of a picture of the app. */
  screenshot: string;
}

export function openBotSoftwareApplication(facts: ZollyBotApplicationFacts) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": ZOLLYBOT_APPLICATION_ID,
    name: "ZollyBot",
    url: ZOLLYBOT_SITE_URL,
    image: ZOLLYBOT_SOCIAL_IMAGE_URL,
    description: ZOLLYBOT_SITE_DESCRIPTION,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "AI agent app",
    operatingSystem: [
      "macOS 13 or later (Apple silicon or Intel)",
      "Windows 10 or later (x64)",
      "Linux (x64 or arm64)",
    ],
    // The installers themselves: schema.org's `downloadUrl` is the file, not a page about it.
    downloadUrl: [
      ZOLLYBOT_DOWNLOAD_LINKS.macos,
      ZOLLYBOT_ALTERNATE_DOWNLOAD_LINKS.macos,
      ZOLLYBOT_DOWNLOAD_LINKS.windows,
      ZOLLYBOT_DOWNLOAD_LINKS.linux,
      ZOLLYBOT_ALTERNATE_DOWNLOAD_LINKS.linux,
    ].map((path) => new URL(path, ZOLLYBOT_SITE_URL).toString()),
    // What people ask an assistant for. Keep it to what the released app does.
    featureList: [
      "Runs Codex, Claude Code, Gemini (Antigravity), Grok and OpenCode agents",
      "Uses your ChatGPT, Claude, Google AI Pro or Ultra, or Grok plan",
      "Any OpenAI-compatible model server, also one on your own computer",
      "Agents that work as a team and keep their workspace and history",
      "Chats, files and workspaces stay on your computer",
      "iPhone and Android apps that connect to your own computer",
      "Free for noncommercial use",
    ],
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    softwareVersion: facts.version,
    screenshot: facts.screenshot,
    license: ZOLLYBOT_LICENSE_URL,
    publisher: { "@id": ZOLLYBOT_ORGANIZATION_ID },
    sameAs: [ZOLLYBOT_REPOSITORY_URL, ZOLLYBOT_PRODUCT_HUNT_URL],
  } as const;
}

export type ZollyBotSoftwareApplication = ReturnType<typeof openBotSoftwareApplication>;

// Search engines read these two for the site name and the logo next to a result.
const ZOLLYBOT_ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ZOLLYBOT_ORGANIZATION_ID,
  name: "ZollyBot",
  url: ZOLLYBOT_SITE_URL,
  logo: ZOLLYBOT_LOGO_URL,
  sameAs: [ZOLLYBOT_REPOSITORY_URL, ZOLLYBOT_X_URL, ZOLLYBOT_PRODUCT_HUNT_URL],
} as const;

const ZOLLYBOT_WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": ZOLLYBOT_WEBSITE_ID,
  name: "ZollyBot",
  url: ZOLLYBOT_SITE_URL,
  publisher: { "@id": ZOLLYBOT_ORGANIZATION_ID },
} as const;

export const ZOLLYBOT_SECURITY_HEADERS = {
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
} as const;

/**
 * @param interLatinFont The hashed URL of Inter's upright latin range, the one font
 * file this site downloads. It is reached through two levels of CSS `@import`, so a
 * browser only learns of it after the stylesheet has parsed. That is late enough
 * that the first paint uses a fallback face and every line of text moves when Inter
 * replaces it. The caller passes the same hashed asset the `@font-face` rule asks
 * for, so the preload below is that request and not a second one.
 */
export function openBotRootHead(interLatinFont: string) {
  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: ZOLLYBOT_SITE_TITLE },
      { name: "description", content: ZOLLYBOT_SITE_DESCRIPTION },
      { name: "application-name", content: "ZollyBot" },
      { name: "color-scheme", content: "dark" },
      { name: "theme-color", content: "#1a1a1a" },
    ],
    links: [
      {
        rel: "preload",
        as: "font" as const,
        type: "font/woff2",
        href: interLatinFont,
        crossorigin: "anonymous" as const,
      },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  };
}

/** The home page's own social card. Other pages without a card of their own keep the site's card. */
const ZOLLYBOT_HOME_SOCIAL_IMAGE: PageSocialImage = {
  path: "/social/home.jpg",
  alt: "Models come and go. Your team stays. ZollyBot agents on a paper planet",
};

export function openBotHomeHead(application: ZollyBotSoftwareApplication, siteUrl: string) {
  const image = pageSocialImageMeta(ZOLLYBOT_HOME_SOCIAL_IMAGE, siteUrl);
  return {
    meta: [
      { "script:ld+json": application },
      { "script:ld+json": ZOLLYBOT_ORGANIZATION },
      { "script:ld+json": ZOLLYBOT_WEBSITE },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ZollyBot" },
      { property: "og:locale", content: "en_US" },
      { property: "og:url", content: ZOLLYBOT_SITE_URL },
      { property: "og:title", content: ZOLLYBOT_SITE_TITLE },
      { property: "og:description", content: ZOLLYBOT_SITE_DESCRIPTION },
      ...image.openGraph,
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: ZOLLYBOT_X_HANDLE },
      { name: "twitter:title", content: ZOLLYBOT_SITE_TITLE },
      { name: "twitter:description", content: ZOLLYBOT_SITE_DESCRIPTION },
      ...image.twitter,
      { "script:ld+json": LANDING_FAQ_STRUCTURED_DATA },
    ],
    links: [{ rel: "canonical", href: ZOLLYBOT_SITE_URL }],
  };
}
