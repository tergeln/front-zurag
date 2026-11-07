import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { signedOriginalLinks } from "@/lib/downloads";

/**
 * GET /api/downloads/{photoId}
 * For a buyer with an active download right: redirect to a 5-minute signed
 * link that saves the full-resolution original. Everyone else: 401/403.
 */
export async function GET(_request: Request, { params }: RouteContext<"/api/downloads/[photoId]">) {
  const { photoId } = await params;
  if (!(await getCurrentUser())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [link] = await signedOriginalLinks([photoId], true);
  if (!link) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const res = NextResponse.redirect(link.url, 302);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
