import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { headObjectSize } from "@/lib/r2";

type Row = { id: string; original_key: string; bytes: number; uploaded_by: string; status: string };

/**
 * Step 2 of a bulk upload. Confirms each file really arrived in R2 with the
 * expected size before the photo moves on to processing.
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { photoIds?: unknown } | null;
  const ids = Array.isArray(body?.photoIds) ? body.photoIds.filter((x): x is string => typeof x === "string" && /^[0-9a-f-]{36}$/.test(x)) : [];
  if (ids.length < 1 || ids.length > 100) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const supabase = await createClient();
  const { data } = await supabase.from("photos").select("id, original_key, bytes, uploaded_by, status").in("id", ids).returns<Row[]>();
  const mine = (data ?? []).filter((r) => r.uploaded_by === user.id && r.status === "uploading");

  const checks = await Promise.all(
    mine.map(async (r) => ({ id: r.id, ok: (await headObjectSize(r.original_key).catch(() => null)) === Number(r.bytes) })),
  );
  const verified = checks.filter((c) => c.ok).map((c) => c.id);

  let completed = 0;
  if (verified.length) {
    const { data: n, error } = await supabase.rpc("mark_photos_uploaded", { p_photo_ids: verified });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    completed = Number(n);
  }
  return NextResponse.json({ completed, failed: ids.filter((id) => !verified.includes(id)) });
}
