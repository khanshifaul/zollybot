import type { NextRequest } from "next/server";
import { getAgent } from "@/lib/marketplace-data";

export function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  return params.then(({ id }) => {
    const agent = getAgent(id);
    return agent
      ? Response.json(agent, { headers: { "cache-control": "public, s-maxage=600, stale-while-revalidate=3600" } })
      : Response.json({ error: "not_found" }, { status: 404 });
  });
}
