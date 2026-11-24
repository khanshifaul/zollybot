import type { NextRequest } from "next/server";
import { getSkillVersion } from "@/lib/marketplace-data";

export function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> },
): Promise<Response> {
  return params.then(({ id, versionId }) => {
    const skill = getSkillVersion(id, versionId);
    return skill
      ? Response.json(skill, { headers: { "cache-control": "public, s-maxage=600, stale-while-revalidate=3600" } })
      : Response.json({ error: "not_found" }, { status: 404 });
  });
}
