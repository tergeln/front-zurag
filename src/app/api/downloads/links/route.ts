import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { ZIP_MAX_PHOTOS, signedOriginalLinks } from "@/lib/downloads";

/**
 * POST /api/downloads/links  { photoIds: string[] }  (max 50)
 * Signed links for the ZIP download. The browser fetches the originals
 * straight from storage and builds the ZIP itself, so the server never has
 * to hold hundreds of megabytes (Cloudflare Workers have tight limits).
 */
export async function POST(request: NextRequest) {
  if (!(await getCurrentUser())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { photoIds?: unknown } | null;
  const ids = Array.isArray(body?.photoIds) ? body.photoIds.filter((x): x is string => typeof x === "string") : [];
  if (!ids.length || ids.length > ZIP_MAX_PHOTOS) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const links = await signedOriginalLinks(ids, false);
  return NextResponse.json({ links }, { headers: { "Cache-Control": "no-store" } });
}
