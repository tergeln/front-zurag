import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getSearchToken } from "@/lib/public/codes";
import { presignGet } from "@/lib/r2";

/**
 * GET /api/photos/{id}/image?variant=thumb|preview
 * Redirects to a short-lived signed URL for the watermarked thumbnail or
 * preview. Originals are never served here.
 * Customers see only photos their selfie search matched in this browser,
 * photos in their cart, and photos they bought. Admins see every photo and
 * photographers their own.
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/api/photos/[id]/image">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse(null, { status: 404 });
  const variant = request.nextUrl.searchParams.get("variant") === "preview" ? "preview" : "thumb";
  const supabase = await createClient();

  const { data: publicKey } = await supabase.rpc("public_photo_image_key", { p_photo_id: id, p_variant: variant, p_token: await getSearchToken() });
  let key = typeof publicKey === "string" ? publicKey : null;

  if (!key && (await getCurrentUser())) {
    // RLS: admins see every photo, photographers their own.
    const { data } = await supabase
      .from("photos")
      .select("thumb_key, preview_key")
      .eq("id", id)
      .neq("status", "deleted")
      .maybeSingle<{ thumb_key: string | null; preview_key: string | null }>();
    key = (variant === "preview" ? data?.preview_key : data?.thumb_key) ?? null;
  }
  if (!key) return new NextResponse(null, { status: 404 });

  const res = NextResponse.redirect(await presignGet(key, 600), 302);
  // The browser may reuse the redirect for a few minutes (the signed URL lives 10).
  res.headers.set("Cache-Control", "private, max-age=300");
  return res;
}
