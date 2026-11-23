/**
 * The release assets that every surface must agree on: the desktop updater, the hosted-server
 * release check, the Linux installer, the public download page, and the release verifier.
 *
 * Keep this module free of Node.js and React imports so the web app can read it too. The release
 * workflow writes the names here; the manifests and GitHub assets are the runtime truth.
 */

export const RELEASE_REPOSITORY = "khanshifaul/zollybot";
export const RELEASE_REPOSITORY_URL = `https://github.com/${RELEASE_REPOSITORY}`;
export const RELEASE_DOWNLOAD_BASE = `${RELEASE_REPOSITORY_URL}/releases/download`;
/** A stable URL: every file under it comes from the newest published release. */
export const LATEST_RELEASE_DOWNLOAD_BASE = `${RELEASE_REPOSITORY_URL}/releases/latest/download`;
export const LATEST_RELEASE_URL = `${RELEASE_REPOSITORY_URL}/releases/latest`;

export type DesktopReleaseArch = "x64" | "arm64";
export type DesktopReleasePlatform = "linux" | "darwin" | "win32";

export interface DesktopReleaseTarget {
  readonly id: string;
  readonly platform: DesktopReleasePlatform;
  readonly arch: DesktopReleaseArch;
  /** The electron-updater manifest for this platform. */
  readonly manifest: string;
  /** The artifact electron-updater downloads. */
  readonly artifact: (version: string) => string;
  /** More files in the same release, for a direct download rather than an update. */
  readonly extras?: (version: string) => readonly string[];
  /** The checksum list that the installer reads. */
  readonly checksums: string;
}

const linuxX64: DesktopReleaseTarget = {
  id: "linux-x64",
  platform: "linux",
  arch: "x64",
  manifest: "latest-linux.yml",
  artifact: (version) => `zollybot-gui-${version}-x86_64.AppImage`,
  checksums: "SHA256SUMS-linux-x64.txt",
};

const linuxArm64: DesktopReleaseTarget = {
  id: "linux-arm64",
  platform: "linux",
  arch: "arm64",
  manifest: "latest-linux-arm64.yml",
  artifact: (version) => `zollybot-gui-${version}-arm64.AppImage`,
  checksums: "SHA256SUMS-linux-arm64.txt",
};

/**
 * electron-updater reads one `latest-mac.yml` for both architectures. The release workflow merges
 * the ARM64 and x64 manifests into it; each architecture then picks its ZIP from the `files` list.
 */
const macosX64: DesktopReleaseTarget = {
  id: "macos-x64",
  platform: "darwin",
  arch: "x64",
  manifest: "latest-mac.yml",
  artifact: (version) => `zollybot-gui-${version}-x64.zip`,
  extras: (version) => [`zollybot-gui-${version}-x64.dmg`],
  checksums: "SHA256SUMS-macos-x64.txt",
};

const macosArm64: DesktopReleaseTarget = {
  id: "macos-arm64",
  platform: "darwin",
  arch: "arm64",
  manifest: "latest-mac.yml",
  artifact: (version) => `zollybot-gui-${version}-arm64.zip`,
  extras: (version) => [`zollybot-gui-${version}-arm64.dmg`],
  checksums: "SHA256SUMS-macos-arm64.txt",
};

const windowsX64: DesktopReleaseTarget = {
  id: "windows-x64",
  platform: "win32",
  arch: "x64",
  manifest: "latest.yml",
  artifact: (version) => `zollybot-gui-${version}-x64.exe`,
  checksums: "SHA256SUMS-windows-x64.txt",
};

export const DESKTOP_RELEASE_TARGETS = {
  "linux-x64": linuxX64,
  "linux-arm64": linuxArm64,
  "macos-x64": macosX64,
  "macos-arm64": macosArm64,
  "windows-x64": windowsX64,
} as const satisfies Record<string, DesktopReleaseTarget>;

export type DesktopReleaseTargetId = keyof typeof DESKTOP_RELEASE_TARGETS;

/** The target for a Node platform and architecture, or null when no build is published. */
export function desktopReleaseTarget(platform: string, arch: string): DesktopReleaseTarget | null {
  if (platform === "linux" && arch === "x64") return linuxX64;
  if (platform === "linux" && arch === "arm64") return linuxArm64;
  if (platform === "darwin" && arch === "x64") return macosX64;
  if (platform === "darwin" && arch === "arm64") return macosArm64;
  if (platform === "win32" && arch === "x64") return windowsX64;
  return null;
}

/** The Android APK that the public download page offers. */
export const ANDROID_RELEASE_ASSET = (version: string) => `zollybot-android-${version}.apk`;

/** A direct download URL for one version. */
export function releaseDownloadUrl(version: string, asset: string): string {
  return `${RELEASE_DOWNLOAD_BASE}/v${version}/${asset}`;
}

/** A stable URL for one file of the newest release. */
export function latestReleaseAssetUrl(asset: string): string {
  return `${LATEST_RELEASE_DOWNLOAD_BASE}/${asset}`;
}

/** The stable electron-updater manifest URL for `manifest`. */
export function latestReleaseManifestUrl(manifest: string): string {
  return latestReleaseAssetUrl(manifest);
}

/** Whether a manifest lists `artifact`, comparing only the file name so absolute URLs also match. */
export function manifestListsArtifact(files: readonly { url: string }[], artifact: string): boolean {
  return files.some((file) => {
    const withoutQuery = file.url.split(/[?#]/u, 1)[0] ?? file.url;
    const name = withoutQuery.slice(withoutQuery.lastIndexOf("/") + 1);
    try {
      return decodeURIComponent(name) === artifact;
    } catch {
      return name === artifact;
    }
  });
}
