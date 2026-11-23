import type { MarketplaceAgentQuery } from "@zollybot/contracts/ipc";
import { isSkillCategory } from "@zollybot/contracts/ipc";
import type { NextRequest } from "next/server";
import { listAgents } from "@/lib/marketplace-data";

function query(params: URLSearchParams): MarketplaceAgentQuery {
  const category = params.get("category");
  const limit = Number(params.get("limit"));
  return {
    ...(params.get("query") ? { query: params.get("query") ?? undefined } : {}),
    ...(category && isSkillCategory(category) ? { category } : {}),
    ...(params.get("featured") === "true" ? { featured: true } : {}),
    ...(params.get("verified") === "true" ? { verified: true } : {}),
    ...(params.get("sort") === "installs" ? { sort: "installs" as const } : {}),
    ...(params.get("cursor") ? { cursor: params.get("cursor") ?? undefined } : {}),
    ...(Number.isFinite(limit) && limit > 0 ? { limit } : {}),
  };
}

export function GET(request: NextRequest): Response {
  return Response.json(listAgents(query(request.nextUrl.searchParams)), {
    headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
