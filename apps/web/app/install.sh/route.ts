import { RELEASE_REPOSITORY } from "@zollybot/contracts/release-assets";
import { NextResponse } from "next/server";

/** The installer lives in the repository so the hosted copy and the source cannot drift. */
export function GET(): NextResponse {
  return NextResponse.redirect(`https://raw.githubusercontent.com/${RELEASE_REPOSITORY}/main/site/install.sh`, 307);
}
