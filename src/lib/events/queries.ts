import "server-only";
import { createClient } from "@/lib/supabase/server";

// Reads go through RLS: admins see everything, photographers only events they
// belong to and only their own photos.

export type EventRow = {
  id: string;
  slug: string;
  name_mn: string;
  name_en: string | null;
  description_mn: string | null;
  description_en: string | null;
  event_date: string;
  location: string | null;
  status: "draft" | "published" | "archived";
  visibility: "public" | "private";
  created_by: string;
};

export type PhotoRow = {
  id: string;
  thumb_key: string | null;
  original_filename: string | null;
  bytes: number;
  price_mnt: number;
  status: "uploading" | "processing" | "ready" | "failed" | "published" | "hidden" | "deleted";
  owner_type: "platform" | "photographer";
  created_at: string;
  owner: { full_name: string | null } | null;
};

export type Participant = { user_id: string; role: "owner" | "contributor"; user: { full_name: string | null } | null };

const EVENT_COLUMNS = "id, slug, name_mn, name_en, description_mn, description_en, event_date, location, status, visibility, created_by";

export async function listEvents(): Promise<(EventRow & { photo_count: number })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select(`${EVENT_COLUMNS}, photos(count)`)
    .neq("photos.status", "deleted")
    .order("event_date", { ascending: false })
    .limit(200);
  return (data ?? []).map((e) => {
    const { photos, ...rest } = e as EventRow & { photos: { count: number }[] };
    return { ...rest, photo_count: photos?.[0]?.count ?? 0 };
  });
}

export async function getEvent(id: string): Promise<EventRow | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select(EVENT_COLUMNS).eq("id", id).maybeSingle<EventRow>();
  return data ?? null;
}

export async function getMyEventRole(eventId: string, userId: string): Promise<"owner" | "contributor" | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("event_photographers").select("role").eq("event_id", eventId).eq("user_id", userId).maybeSingle<{ role: "owner" | "contributor" }>();
  return data?.role ?? null;
}

export async function getParticipants(eventId: string): Promise<Participant[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_photographers")
    .select("user_id, role, user:users!event_photographers_user_id_fkey(full_name)")
    .eq("event_id", eventId)
    .order("created_at")
    .returns<Participant[]>();
  return data ?? [];
}

export const PHOTO_PAGE_SIZE = 100;

export async function listPhotos(eventId: string, page: number): Promise<{ rows: PhotoRow[]; total: number }> {
  const supabase = await createClient();
  const { data, count } = await supabase
    .from("photos")
    .select("id, thumb_key, original_filename, bytes, price_mnt, status, owner_type, created_at, owner:users!photos_owner_id_fkey(full_name)", { count: "exact" })
    .eq("event_id", eventId)
    .neq("status", "deleted")
    .order("created_at", { ascending: false })
    .range(page * PHOTO_PAGE_SIZE, page * PHOTO_PAGE_SIZE + PHOTO_PAGE_SIZE - 1)
    .returns<PhotoRow[]>();
  return { rows: data ?? [], total: count ?? 0 };
}
