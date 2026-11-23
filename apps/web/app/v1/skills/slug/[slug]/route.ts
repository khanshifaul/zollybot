import type { NextRequest } from "next/server";
import { getSkillBySlug } from "@/lib/marketplace-data";

export function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  return params.then(({ slug }) => {
    const skill = getSkillBySlug(slug);
    return skill
      ? Response.json(skill, { headers: { "cache-control": "public, s-maxage=600, stale-while-revalidate=3600" } })
      : Response.json({ error: "not_found" }, { status: 404 });
  });
}
