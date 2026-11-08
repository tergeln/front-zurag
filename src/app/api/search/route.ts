import { NextResponse, type NextRequest } from "next/server";
import { crossSiteRejected, isSameOrigin } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureSearchToken, getEventCodes } from "@/lib/public/codes";
import { getPublicPhotos } from "@/lib/public/queries";

const MAX_SELFIE_BYTES = 10 * 1024 * 1024;
const error = (code: string, status: number) => NextResponse.json({ error: code }, { status });

/** Network address, hashed with a server secret so the database never stores the IP itself. */
async function ipHash(request: NextRequest, secret: string): Promise<string> {
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`ip:${ip}`));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * POST /api/search  (multipart: eventId, image, consent=on)
 * No account needed. This browser gets a random token (httpOnly cookie).
 * 1. The database checks consent, that the event has face search on and is
 *    visible to this visitor, and the rate limits (per browser and per
 *    network), and logs the search (never the image).
 * 2. The selfie goes to the internal AI service, which compares it with the
 *    faces of this one event and forgets it.
 * 3. The matches are saved for this browser for 24 hours; only these photos
 *    (plus cart and purchases) can be viewed.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return crossSiteRejected();
  const aiUrl = process.env.AI_SERVICE_URL;
  const aiToken = process.env.AI_SERVICE_TOKEN;
  if (!aiUrl || !aiToken) return error("generic", 503);

  const form = await request.formData().catch(() => null);
  const eventId = form?.get("eventId");
  const image = form?.get("image");
  if (typeof eventId !== "string" || !/^[0-9a-f-]{36}$/.test(eventId) || !(image instanceof File)) return error("invalid_image", 400);
  if (form?.get("consent") !== "on") return error("no_consent", 403);
  if (image.size > MAX_SELFIE_BYTES) return error("too_large", 413);
  if (!image.type.startsWith("image/")) return error("invalid_image", 400);

  const token = await ensureSearchToken();
  const db = createAdminClient(); // the search functions are callable only by the server
  const { data: logId, error: gate } = await db.rpc("begin_face_search", {
    p_event_id: eventId,
    p_codes: await getEventCodes(),
    p_token: token,
    p_ip_hash: await ipHash(request, aiToken),
    p_consent: true,
  });
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
  const { error: saveError } = await db.rpc("finish_face_search", { p_log_id: logId, p_token: token, p_matches: matches });
  if (saveError) return error("generic", 500);

  const score = new Map(matches.map((m) => [m.photo_id, m.similarity]));
  const photos = (await getPublicPhotos(matches.map((m) => m.photo_id)))
    .map((p) => ({ ...p, similarity: score.get(p.id) ?? 0 }))
    .sort((a, b) => b.similarity - a.similarity);
  return NextResponse.json({ photos });
}
