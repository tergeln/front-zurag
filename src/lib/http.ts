import { NextResponse } from "next/server";

/**
 * Cross-site request guard for cookie-authenticated POST API routes.
 * Session cookies are SameSite=Lax already; this is a second layer: the
 * request must come from a page on this same site.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function crossSiteRejected() {
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}
