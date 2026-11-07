import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { presignGet } from "@/lib/r2";

/**
 * GET /api/photos/{id}/image?variant=thumb|preview
 * Redirects to a short-lived signed URL for the watermarked thumbnail or
 * preview. Originals are never served here. Who may see a photo is decided by
 * RLS (for now: admins and the photo's owner; customers come in Phase 7).
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/api/photos/[id]/image">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse(null, { status: 404 });
  if (!(await getCurrentUser())) return new NextResponse(null, { status: 401 });

  const variant = request.nextUrl.searchParams.get("variant") === "preview" ? "preview" : "thumb";
  const supabase = await createClient();
  const { data } = await supabase
    .from("photos")
    .select("thumb_key, preview_key")
    .eq("id", id)
    .neq("status", "deleted")
    .maybeSingle<{ thumb_key: string | null; preview_key: string | null }>();

  const key = variant === "preview" ? data?.preview_key : data?.thumb_key;
  if (!key) return new NextResponse(null, { status: 404 });

  const res = NextResponse.redirect(await presignGet(key, 600), 302);
  // The browser may reuse the redirect for a few minutes (the signed URL lives 10).
  res.headers.set("Cache-Control", "private, max-age=300");
  return res;
}
