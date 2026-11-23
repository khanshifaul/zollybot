import type { MarketplaceSkillQuery, MarketplaceSkillSort } from "@zollybot/contracts/ipc";
import { isSkillCategory } from "@zollybot/contracts/ipc";
import type { NextRequest } from "next/server";
import { listSkills } from "@/lib/marketplace-data";

function sort(value: string | null): MarketplaceSkillSort | undefined {
  return value === "installs" || value === "updated" || value === "name" ? value : undefined;
}

function query(params: URLSearchParams): MarketplaceSkillQuery {
  const category = params.get("category");
  const limit = Number(params.get("limit"));
  return {
    ...(params.get("query") ? { query: params.get("query") ?? undefined } : {}),
    ...(category && isSkillCategory(category) ? { category } : {}),
    ...(params.get("featured") === "true" ? { featured: true } : {}),
    ...(params.get("verified") === "true" ? { verified: true } : {}),
    ...(sort(params.get("sort")) ? { sort: sort(params.get("sort")) } : {}),
    ...(params.get("cursor") ? { cursor: params.get("cursor") ?? undefined } : {}),
    ...(Number.isFinite(limit) && limit > 0 ? { limit } : {}),
  };
}

export function GET(request: NextRequest): Response {
  return Response.json(listSkills(query(request.nextUrl.searchParams)), {
    headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
