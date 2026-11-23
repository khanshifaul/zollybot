import { RELEASE_REPOSITORY } from "@zollybot/contracts/release-assets";
import { NextResponse } from "next/server";

/** Shared plugin links point at the repository catalog until the site has listing pages. */
export function GET(): NextResponse {
  return NextResponse.redirect(`https://github.com/${RELEASE_REPOSITORY}/tree/main/marketplace/plugin-catalog`, 302);
}
