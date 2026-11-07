"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { parsePriceMnt } from "@/lib/uploads";

// Server actions shared by the admin and photographer event pages.
// Every permission check happens inside the database functions they call.

export type EventErrorKey = keyof Dictionary["events"]["errors"];
export type EventFormState = { error?: EventErrorKey; saved?: boolean } | undefined;

function readLocale(formData: FormData): Locale {
  const v = String(formData.get("locale") ?? "");
  return isLocale(v) ? v : defaultLocale;
}

/** Only redirect back to our own admin/photographer event pages. */
function backPath(formData: FormData, locale: Locale): string {
  const back = String(formData.get("back") ?? "");
  return back.startsWith(`/${locale}/admin/events`) || back.startsWith(`/${locale}/photographer/events`) ? back : `/${locale}`;
}

function withError(path: string, key: EventErrorKey) {
  const url = new URL(path, "http://x");
  url.searchParams.set("error", key);
  return url.pathname + url.search;
}

function errorKey(message: string): EventErrorKey {
  switch (message) {
    case "invalid_name":
      return "invalidName";
    case "invalid_date":
      return "invalidDate";
    case "forbidden":
      return "forbidden";
    case "not_found":
      return "notFound";
    case "not_photographer":
      return "notPhotographer";
    case "invalid_price":
      return "invalidPrice";
    default:
      return "generic";
  }
}

function eventFields(formData: FormData) {
  const s = (k: string) => String(formData.get(k) ?? "");
  const date = s("eventDate");
  return {
    p_name_mn: s("nameMn"),
    p_name_en: s("nameEn"),
    p_description_mn: s("descriptionMn"),
    p_description_en: s("descriptionEn"),
    p_event_date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
    p_location: s("location"),
    p_visibility: s("visibility") === "private" ? "private" : "public",
  };
}

async function requireSignedIn(locale: Locale) {
  if (!(await getCurrentUser())) redirect(`/${locale}/login`);
  return createClient();
}

export async function createEvent(_prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const locale = readLocale(formData);
  const supabase = await requireSignedIn(locale);
  const fields = eventFields(formData);
  if (!fields.p_event_date) return { error: "invalidDate" };

  const { data: id, error } = await supabase.rpc("create_event", fields);
  if (error) return { error: errorKey(error.message) };
  const base = String(formData.get("base")) === "admin" ? `/${locale}/admin/events` : `/${locale}/photographer/events`;
  redirect(`${base}/${id}`);
}

export async function updateEvent(_prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const locale = readLocale(formData);
  const supabase = await requireSignedIn(locale);
  const fields = eventFields(formData);
  if (!fields.p_event_date) return { error: "invalidDate" };
  const status = String(formData.get("status"));

  const { error } = await supabase.rpc("update_event", {
    p_event_id: String(formData.get("eventId")),
    ...fields,
    p_status: ["draft", "published", "archived"].includes(status) ? status : null,
  });
  if (error) return { error: errorKey(error.message) };
  revalidatePath(backPath(formData, locale));
  return { saved: true };
}

export async function addParticipant(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await requireSignedIn(locale);
  const back = backPath(formData, locale);
  const { error } = await supabase.rpc("add_event_photographer", {
    p_event_id: String(formData.get("eventId")),
    p_email: String(formData.get("email") ?? ""),
  });
  if (error) redirect(withError(back, errorKey(error.message)));
  revalidatePath(back);
}

export async function removeParticipant(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await requireSignedIn(locale);
  const back = backPath(formData, locale);
  const { error } = await supabase.rpc("remove_event_photographer", {
    p_event_id: String(formData.get("eventId")),
    p_user_id: String(formData.get("userId")),
  });
  if (error) redirect(withError(back, errorKey(error.message)));
  revalidatePath(back);
}

/** Turning face search on requires the attendee-notice confirmation; the database records it as consent. */
export async function setFaceSearch(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await requireSignedIn(locale);
  const back = backPath(formData, locale);
  const enable = formData.get("enabled") === "true";
  if (enable && formData.get("attestation") !== "on") redirect(withError(back, "needAttestation"));

  const { error } = await supabase.rpc("set_event_face_search", { p_event_id: String(formData.get("eventId")), p_enabled: enable });
  if (error) redirect(withError(back, errorKey(error.message)));
  revalidatePath(back);
}

/** Sets (or clears, when empty) the access code customers need for a private event. */
export async function setAccessCode(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await requireSignedIn(locale);
  const back = backPath(formData, locale);
  const { error } = await supabase.rpc("set_event_access_code", {
    p_event_id: String(formData.get("eventId")),
    p_code: String(formData.get("code") ?? ""),
  });
  if (error) redirect(withError(back, error.message === "invalid_code" ? "invalidCode" : errorKey(error.message)));
  revalidatePath(back);
}

function selectedIds(formData: FormData): string[] {
  return formData
    .getAll("photoIds")
    .map(String)
    .filter((id) => /^[0-9a-f-]{36}$/.test(id))
    .slice(0, 500);
}

export async function setPhotoPrices(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await requireSignedIn(locale);
  const back = backPath(formData, locale);
  const ids = selectedIds(formData);
  const price = parsePriceMnt(formData.get("newPrice"));
  if (price === null) redirect(withError(back, "invalidPrice"));
  if (ids.length) {
    const { error } = await supabase.rpc("update_photo_prices", { p_photo_ids: ids, p_price_mnt: price });
    if (error) redirect(withError(back, errorKey(error.message)));
  }
  revalidatePath(back);
}

export async function deletePhotos(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await requireSignedIn(locale);
  const back = backPath(formData, locale);
  const ids = selectedIds(formData);
  if (ids.length) {
    const { error } = await supabase.rpc("delete_photos", { p_photo_ids: ids });
    if (error) redirect(withError(back, errorKey(error.message)));
  }
  revalidatePath(back);
}
