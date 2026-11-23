import { createMarketplaceCatalog } from "@zollybot/team-client/marketplace-catalog";
import { Effect } from "effect";

/** The public marketplace is served from the account service; no user credential is sent. */
export const MARKETPLACE_API_ORIGIN =
  process.env.ZOLLYBOT_AUTH_API_URL ?? process.env.ZOLLYBOT_API_URL ?? "https://api-zollybot.shifaul.dev";

const request = (path: string, init?: RequestInit): Promise<Response> =>
  fetch(new URL(path, MARKETPLACE_API_ORIGIN), {
    ...init,
    headers: { accept: "application/json", ...init?.headers },
    next: { revalidate: 300 },
  });

export const catalog = createMarketplaceCatalog(request);

export type MarketplaceLoad<T> = { data: T; error: null } | { data: null; error: string };

/** Runs one catalog read and turns a missing or failing account service into a page-level message. */
export async function loadMarketplace<T>(
  operation: Effect.Effect<T, { readonly message: string }>,
): Promise<MarketplaceLoad<T>> {
  try {
    return { data: await Effect.runPromise(operation), error: null };
  } catch (cause) {
    return {
      data: null,
      error: cause instanceof Error ? cause.message : "The marketplace is unavailable.",
    };
  }
}

/** The account service stores avatar and card paths relative to its origin. */
export function marketplaceAssetUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value, MARKETPLACE_API_ORIGIN).toString();
  } catch {
    return null;
  }
}

export function marketplaceSearchParams(input: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string" && value.trim()) params.set(key, value.trim());
  }
  return params;
}
