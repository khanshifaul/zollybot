import { type NextRequest, NextResponse } from "next/server";

/** A shared plugin link lands on the Marketplace catalog search until plugin pages have their own route. */
export function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }): Promise<NextResponse> {
  return params.then(({ slug }) => {
    const url = new URL("/marketplace/skills", request.url);
    url.searchParams.set("q", slug);
    return NextResponse.redirect(url, 302);
  });
}
