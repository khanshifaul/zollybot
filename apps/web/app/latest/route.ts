import { RELEASE_REPOSITORY } from "@zollybot/contracts/release-assets";

export const revalidate = 300;

/** The newest desktop release, as plain text for installers and older clients */
export async function GET(): Promise<Response> {
  const response = await fetch(`https://api.github.com/repos/${RELEASE_REPOSITORY}/releases/latest`, {
    headers: { Accept: "application/vnd.github+json" },
    next: { revalidate },
  });
  if (!response.ok) {
    return new Response("The latest release is unavailable.", {
      status: 502,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  const body = await response.json();
  const tag =
    typeof body === "object" && body !== null && "tag_name" in body && typeof body.tag_name === "string"
      ? body.tag_name
      : null;
  const version = tag?.replace(/^v/u, "") ?? null;
  if (version === null || !/^\d+\.\d+\.\d+$/u.test(version)) {
    return new Response("The latest release has no version.", {
      status: 502,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(version, {
    headers: {
      "cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
