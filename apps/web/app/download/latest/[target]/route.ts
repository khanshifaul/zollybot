import {
  ANDROID_RELEASE_ASSET,
  DESKTOP_RELEASE_TARGETS,
  RELEASE_REPOSITORY,
  releaseDownloadUrl,
} from "@zollybot/contracts/release-assets";
import { isOneOf } from "@zollybot/contracts/runtime-values";
import { NextResponse } from "next/server";

const VERSION = /^\d+\.\d+\.\d+$/u;
const DESKTOP_TARGETS = ["linux-x64", "linux-arm64", "macos-x64", "macos-arm64", "windows-x64"] as const;

/** The newest exact file for one website download target. */
export async function GET(_request: Request, { params }: { params: Promise<{ target: string }> }): Promise<Response> {
  const { target } = await params;
  const desktop = isOneOf(DESKTOP_TARGETS, target) ? target : null;
  if (desktop === null && target !== "android") return new Response("Download not found.", { status: 404 });

  const response = await fetch(`https://api.github.com/repos/${RELEASE_REPOSITORY}/releases/latest`, {
    headers: { Accept: "application/vnd.github+json" },
    next: { revalidate: 300 },
  });
  if (!response.ok) return new Response("The latest release is unavailable.", { status: 502 });
  const body = await response.json();
  const tag =
    typeof body === "object" && body !== null && "tag_name" in body && typeof body.tag_name === "string"
      ? body.tag_name
      : null;
  const version = tag?.replace(/^v/u, "") ?? null;
  if (version === null || !VERSION.test(version)) {
    return new Response("The latest release has no version.", { status: 502 });
  }

  if (target === "android") {
    return NextResponse.redirect(releaseDownloadUrl(version, ANDROID_RELEASE_ASSET(version)), 307);
  }
  if (desktop === null) return new Response("Download not found.", { status: 404 });
  const releaseTarget = DESKTOP_RELEASE_TARGETS[desktop];
  const asset = releaseTarget.extras?.(version)[0] ?? releaseTarget.artifact(version);
  return NextResponse.redirect(releaseDownloadUrl(version, asset), 307);
}
