import { RELEASE_REPOSITORY } from "@zollybot/contracts/release-assets";
import { type NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest): NextResponse {
  const file = request.nextUrl.searchParams.get("platform") === "mobile" ? "apps/mobile/CHANGELOG.md" : "CHANGELOG.md";
  return NextResponse.redirect(`https://github.com/${RELEASE_REPOSITORY}/blob/main/${file}`, 302);
}
