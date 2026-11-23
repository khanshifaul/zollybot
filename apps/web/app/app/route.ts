import { type NextRequest, NextResponse } from "next/server";

/** The web client is not hosted from this site yet; send visitors to the download page. */
export function GET(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL("/", request.url), 302);
}
