import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSkillBundle } from "@/lib/marketplace-data";

export function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> },
): Promise<Response> {
  return params.then(({ id, versionId }) => {
    const bundle = getSkillBundle(id, versionId);
    return bundle
      ? NextResponse.redirect(new URL(bundle, request.nextUrl.origin), 307)
      : Response.json({ error: "not_found" }, { status: 404 });
  });
}
