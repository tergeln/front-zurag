import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getEventCodes } from "@/lib/public/codes";
import { getPublicPhotos } from "@/lib/public/queries";

const MAX_SELFIE_BYTES = 10 * 1024 * 1024;
const error = (code: string, status: number) => NextResponse.json({ error: code }, { status });

/**
 * POST /api/search  (multipart: eventId, image)
 * 1. The database checks consent, that this event allows face search for this
 *    visitor, and the rate limit, and logs the search (without the image).
 * 2. The selfie is forwarded to the internal AI service, which compares it with
 *    the faces of this one event and forgets it.
 * 3. Matches are turned into safe photo details (price, photographer).
 * The selfie is never written to disk or storage.
 */
export async function POST(request: NextRequest) {
  if (!(await getCurrentUser())) return error("unauthorized", 401);
  const aiUrl = process.env.AI_SERVICE_URL;
  const aiToken = process.env.AI_SERVICE_TOKEN;
  if (!aiUrl || !aiToken) return error("generic", 503);

  const form = await request.formData().catch(() => null);
  const eventId = form?.get("eventId");
  const image = form?.get("image");
  if (typeof eventId !== "string" || !/^[0-9a-f-]{36}$/.test(eventId) || !(image instanceof File)) return error("invalid_image", 400);
  if (image.size > MAX_SELFIE_BYTES) return error("too_large", 413);
  if (!image.type.startsWith("image/")) return error("invalid_image", 400);

  const supabase = await createClient();
  const codes = await getEventCodes();
  const { data: logId, error: gate } = await supabase.rpc("begin_face_search", { p_event_id: eventId, p_codes: codes });
  if (gate) {
    if (gate.message === "no_consent") return error("no_consent", 403);
    if (gate.message === "rate_limited") return error("rate_limited", 429);
    if (gate.message === "search_disabled") return error("search_disabled", 403);
    return error("generic", 400);
  }

  const upstream = new FormData();
  upstream.append("event_id", eventId);
  upstream.append("image", image, "selfie");
  let res: Response;
  try {
    res = await fetch(`${aiUrl}/search`, {
      method: "POST",
      headers: { "x-internal-token": aiToken },
      body: upstream,
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return error("generic", 502);
  }
  const body = (await res.json().catch(() => ({}))) as { detail?: string; matches?: { photo_id: string; similarity: number }[] };
  if (!res.ok) {
    const known = ["no_face", "face_too_small", "invalid_image", "too_large", "search_disabled"];
    return error(known.includes(body.detail ?? "") ? body.detail! : "generic", res.status === 403 ? 403 : 422);
  }

  const matches = body.matches ?? [];
  const score = new Map(matches.map((m) => [m.photo_id, m.similarity]));
  const photos = (await getPublicPhotos(matches.map((m) => m.photo_id)))
    .map((p) => ({ ...p, similarity: score.get(p.id) ?? 0 }))
    .sort((a, b) => b.similarity - a.similarity);

  await supabase.rpc("finish_face_search", { p_log_id: logId, p_match_count: photos.length });
  return NextResponse.json({ photos });
}
