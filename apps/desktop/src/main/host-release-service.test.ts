import {
  DESKTOP_RELEASE_TARGETS,
  desktopReleaseTarget,
  manifestListsArtifact,
  releaseDownloadUrl,
} from "@zollybot/contracts/release-assets";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { fetchLatestLinuxRelease, HostReleaseService } from "./host-release-service";

function service(
  fetch: typeof globalThis.fetch,
  options: { platform?: NodeJS.Platform; arch?: string; currentVersion?: string } = {},
) {
  return new HostReleaseService({
    currentVersion: options.currentVersion ?? "0.64.0",
    packaged: true,
    platform: options.platform ?? "linux",
    arch: options.arch ?? "x64",
    environment: {},
    updateStatus: () => ({ phase: "ready", managedByHost: false }),
    installationMode: "self",
    fetch,
  });
}

function response(source: string): Response {
  return new Response(source, { status: 200, headers: { "content-type": "text/yaml" } });
}

function fakeFetch(run: (input: RequestInfo | URL) => Promise<Response>): typeof fetch {
  const request = async (input: RequestInfo | URL) => run(input);
  request.preconnect = async () => {};
  return request;
}

describe("desktop release targets", () => {
  it("uses the artifact names that the published manifests list", () => {
    expect(DESKTOP_RELEASE_TARGETS["linux-x64"].artifact("0.65.0")).toBe("zollybot-gui-0.65.0-x86_64.AppImage");
    expect(DESKTOP_RELEASE_TARGETS["linux-arm64"].artifact("0.65.0")).toBe("zollybot-gui-0.65.0-arm64.AppImage");
    expect(DESKTOP_RELEASE_TARGETS["macos-arm64"].artifact("0.65.0")).toBe("zollybot-gui-0.65.0-arm64.zip");
    expect(DESKTOP_RELEASE_TARGETS["windows-x64"].artifact("0.65.0")).toBe("zollybot-gui-0.65.0-x64.exe");
    expect(releaseDownloadUrl("0.65.0", "zollybot-android-0.65.0.apk")).toBe(
      "https://github.com/khanshifaul/zollybot/releases/download/v0.65.0/zollybot-android-0.65.0.apk",
    );
  });

  it("maps only published platforms", () => {
    expect(desktopReleaseTarget("linux", "x64")?.manifest).toBe("latest-linux.yml");
    expect(desktopReleaseTarget("linux", "arm64")?.manifest).toBe("latest-linux-arm64.yml");
    expect(desktopReleaseTarget("darwin", "arm64")?.manifest).toBe("latest-mac.yml");
    expect(desktopReleaseTarget("win32", "arm64")).toBeNull();
  });

  it("matches an absolute manifest URL by file name", () => {
    expect(
      manifestListsArtifact(
        [{ url: "https://example.test/releases/zollybot-gui-0.65.0-x86_64.AppImage?download=1" }],
        "zollybot-gui-0.65.0-x86_64.AppImage",
      ),
    ).toBe(true);
    expect(
      manifestListsArtifact([{ url: "zollybot-gui-0.65.0-x64.AppImage" }], "zollybot-gui-0.65.0-x86_64.AppImage"),
    ).toBe(false);
  });
});

describe("HostReleaseService", () => {
  it("accepts the real Linux manifest", async () => {
    const manifest = [
      "version: 0.65.0",
      "files:",
      "  - url: zollybot-gui-0.65.0-x86_64.AppImage",
      "path: zollybot-gui-0.65.0-x86_64.AppImage",
    ].join("\n");
    const status = await Effect.runPromise(service(fakeFetch(async () => response(manifest))).check());
    expect(status).toMatchObject({ phase: "available", latestVersion: "0.65.0" });
  });

  it("accepts the merged macOS manifest for an arm64 build", async () => {
    const manifest = [
      "version: 0.65.0",
      "files:",
      "  - url: zollybot-gui-0.65.0-arm64.zip",
      "  - url: zollybot-gui-0.65.0-x64.zip",
    ].join("\n");
    const status = await Effect.runPromise(
      service(
        fakeFetch(async () => response(manifest)),
        { platform: "darwin", arch: "arm64" },
      ).check(),
    );
    expect(status.phase).toBe("available");
  });

  it("rejects a manifest that does not name its artifact", async () => {
    const manifest = ["version: 0.65.0", "files:", "  - url: ZollyBot-0.65.0-x86_64.AppImage"].join("\n");
    const status = await Effect.runPromise(service(fakeFetch(async () => response(manifest))).check());
    expect(status).toMatchObject({ phase: "error", latestVersion: null });
  });

  it("fetches the ARM64 Linux manifest", async () => {
    const urls: string[] = [];
    const manifest = ["version: 0.65.0", "files:", "  - url: zollybot-gui-0.65.0-arm64.AppImage"].join("\n");
    const version = await fetchLatestLinuxRelease(
      "arm64",
      fakeFetch(async (input) => {
        urls.push(String(input));
        return response(manifest);
      }),
      new AbortController().signal,
    );
    expect(version).toBe("0.65.0");
    expect(urls).toEqual(["https://github.com/khanshifaul/zollybot/releases/latest/download/latest-linux-arm64.yml"]);
  });
});
