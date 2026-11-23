import { RELEASE_REPOSITORY } from "@zollybot/contracts/release-assets";
import { NextResponse } from "next/server";

export function GET(): NextResponse {
  return NextResponse.redirect(`https://github.com/${RELEASE_REPOSITORY}/blob/main/CLA.md`, 302);
}
