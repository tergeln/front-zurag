import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getEventCodes, getSearchToken } from "./codes";

// Customer-facing reads. They all go through database functions that return
// only safe columns, for published events the visitor is allowed to see.

export type PublicEventCard = {
  id: string;
  slug: string;
  name_mn: string;
  name_en: string | null;
  event_date: string;
  location: string | null;
  face_search_enabled: boolean;
  cover_photo_id: string | null;
  photo_count: number;
};

export type PublicEvent = Omit<PublicEventCard, "cover_photo_id"> & {
  description_mn: string | null;
  description_en: string | null;
  visibility: "public" | "private";
  locked: boolean;
};

export type PublicPhoto = { id: string; price_mnt: number; width: number | null; height: number | null; owner_name: string | null };

export type PublicPhotoDetail = PublicPhoto & { event_id: string; event_slug: string; event_name_mn: string; event_name_en: string | null; owner_slug: string | null };

export async function listPublicEvents(): Promise<PublicEventCard[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("list_public_events", { p_limit: 60, p_offset: 0 });
  return (data ?? []) as PublicEventCard[];
}

export async function getPublicEvent(slug: string): Promise<PublicEvent | null> {
  if (!/^[a-z0-9-]{1,64}$/.test(slug)) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_event", { p_slug: slug, p_codes: await getEventCodes() });
  return ((data ?? []) as PublicEvent[])[0] ?? null;
}

export async function getPublicPhotos(ids: string[]): Promise<PublicPhotoDetail[]> {
  if (!ids.length) return [];
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_photos", { p_ids: ids.slice(0, 200), p_token: await getSearchToken() });
  return (data ?? []) as PublicPhotoDetail[];
}

export type MatchedPhoto = PublicPhotoDetail & { similarity: number };

/** This browser's selfie matches for one event (last 24 hours), best first. */
export async function listMyMatches(eventId: string): Promise<MatchedPhoto[]> {
  const token = await getSearchToken();
  if (!token) return [];
  const supabase = await createClient();
  const { data } = await supabase.rpc("list_my_matches", { p_event_id: eventId, p_token: token });
  const rows = (data ?? []) as { photo_id: string; similarity: number | null }[];
  const score = new Map(rows.map((r) => [r.photo_id, r.similarity ?? 0]));
  return (await getPublicPhotos(rows.map((r) => r.photo_id)))
    .map((p) => ({ ...p, similarity: score.get(p.id) ?? 0 }))
    .sort((a, b) => b.similarity - a.similarity);
}

export type PublicPhotographerCard = { slug: string; display_name: string; bio: string | null; photo_count: number };
export type PublicPhotographer = { slug: string; display_name: string; bio: string | null; portfolio_urls: string[] };

const SLUG_RE = /^[a-z0-9-]{3,40}$/;

export async function listPublicPhotographers(): Promise<PublicPhotographerCard[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("list_public_photographers", { p_limit: 100, p_offset: 0 });
  return (data ?? []) as PublicPhotographerCard[];
}

export async function getPublicPhotographer(slug: string): Promise<PublicPhotographer | null> {
  if (!SLUG_RE.test(slug)) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_photographer", { p_slug: slug });
  return ((data ?? []) as PublicPhotographer[])[0] ?? null;
}

export async function listPublicPhotographerEvents(slug: string): Promise<PublicEventCard[]> {
  if (!SLUG_RE.test(slug)) return [];
  const supabase = await createClient();
  const { data } = await supabase.rpc("list_public_photographer_events", { p_slug: slug });
  return ((data ?? []) as Omit<PublicEventCard, "face_search_enabled">[]).map((e) => ({ ...e, face_search_enabled: false }));
}

export type CartRow = {
  photo_id: string;
  price_mnt: number;
  owner_name: string | null;
  event_slug: string;
  event_name_mn: string;
  event_name_en: string | null;
  available: boolean;
};

export async function getCart(): Promise<CartRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_cart");
  return (data ?? []) as CartRow[];
}

export async function getCartPhotoIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("cart_items").select("photo_id");
  return new Set((data ?? []).map((r: { photo_id: string }) => r.photo_id));
}
