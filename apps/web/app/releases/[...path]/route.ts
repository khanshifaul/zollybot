import { RELEASE_REPOSITORY } from "@zollybot/contracts/release-assets";
import { NextResponse } from "next/server";

const VERSION = /^\d+\.\d+\.\d+$/u;
const FILE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/u;
const BRIDGE_VERSION = "0.62.10";
const BRIDGED_MANIFEST = /^latest(?:-linux(?:-arm64)?|-mac)?\.ya?ml$/u;

/**
 * Keeps the old release URLs alive and bootstraps clients that still carry the
 * `/releases/0.62.10` updater feed. Their manifest arrives from the newest release, so every relative
 * artifact name resolves back through this route and then to the newest GitHub asset.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }): Promise<Response> {
  const [version, ...rest] = (await params).path;
  const file = rest.join("/");
  if (version === undefined || !VERSION.test(version) || !FILE.test(file)) {
    return new Response("Release not found.", { status: 404 });
  }

  if (version === BRIDGE_VERSION) {
    if (BRIDGED_MANIFEST.test(file)) {
      const upstream = await fetch(`https://github.com/${RELEASE_REPOSITORY}/releases/latest/download/${file}`, {
        next: { revalidate: 300 },
      });
      if (!upstream.ok) return new Response("Release manifest unavailable.", { status: 502 });
      return new Response(await upstream.text(), {
        headers: {
          "cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
          "content-type": "text/yaml; charset=utf-8",
        },
      });
    }
    return NextResponse.redirect(`https://github.com/${RELEASE_REPOSITORY}/releases/latest/download/${file}`, 307);
  }

  return NextResponse.redirect(`https://github.com/${RELEASE_REPOSITORY}/releases/download/v${version}/${file}`, 307);
}
