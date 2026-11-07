import { NextResponse, type NextRequest } from "next/server";
import { crossSiteRejected, isSameOrigin } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { presignPut } from "@/lib/r2";
import { parsePresignBody } from "@/lib/uploads";

type UploadRow = { file_index: number; photo_id: string | null; original_key: string | null; duplicate: boolean };

/**
 * Step 1 of a bulk upload. The database decides whether this user may upload
 * to this event, skips duplicates and creates the photo rows; this route then
 * signs one short-lived PUT URL per new file. Files go straight to R2.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return crossSiteRejected();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = parsePresignBody(await request.json().catch(() => null));
  if (!body) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_photo_uploads", {
    p_event_id: body.eventId,
    p_price_mnt: body.priceMnt,
    p_files: body.files.map((f) => ({ sha256: f.sha256, bytes: f.size, mime: f.type, filename: f.name })),
  });
  if (error) {
    const status = error.message === "forbidden" ? 403 : error.message === "not_found" ? 404 : error.message === "rate_limited" ? 429 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }

  const rows = (data ?? []) as UploadRow[];
  const results = await Promise.all(
    rows.map(async (r) =>
      r.duplicate || !r.photo_id || !r.original_key
        ? { index: r.file_index, duplicate: true as const }
        : { index: r.file_index, photoId: r.photo_id, uploadUrl: await presignPut(r.original_key, body.files[r.file_index].type) },
    ),
  );
  return NextResponse.json({ results });
}
