"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getEventCodes, rememberEventCode } from "./codes";

function readLocale(formData: FormData): Locale {
  const v = String(formData.get("locale") ?? "");
  return isLocale(v) ? v : defaultLocale;
}

const isUuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f-]{36}$/.test(v);

/** Private events: check the code in the database, then remember it in a cookie. */
export async function unlockEvent(formData: FormData) {
  const locale = readLocale(formData);
  const slug = String(formData.get("slug") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  const back = `/${locale}/events/${encodeURIComponent(slug)}`;
  if (!isUuid(eventId) || !code) redirect(`${back}?code=wrong`);

  const supabase = await createClient();
  const { data: ok } = await supabase.rpc("can_view_event", { p_event_id: eventId, p_codes: { [eventId]: code } });
  if (ok !== true) redirect(`${back}?code=wrong`);
  await rememberEventCode(eventId, code);
  redirect(back);
}

export type CartActionResult = { ok: true } | { ok: false; error: "login" | "not_available" | "cart_full" | "generic" };

export async function addToCart(photoId: string): Promise<CartActionResult> {
  if (!isUuid(photoId)) return { ok: false, error: "not_available" };
  if (!(await getCurrentUser())) return { ok: false, error: "login" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("add_to_cart", { p_photo_id: photoId, p_codes: await getEventCodes() });
  if (error) return { ok: false, error: error.message === "not_available" || error.message === "cart_full" ? error.message : "generic" };
  revalidatePath("/", "layout"); // header cart count
  return { ok: true };
}

export async function removeFromCart(photoId: string): Promise<CartActionResult> {
  if (!isUuid(photoId)) return { ok: false, error: "not_available" };
  if (!(await getCurrentUser())) return { ok: false, error: "login" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_from_cart", { p_photo_id: photoId });
  if (error) return { ok: false, error: "generic" };
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Form version for the cart page's remove buttons. */
export async function removeFromCartForm(formData: FormData) {
  await removeFromCart(String(formData.get("photoId") ?? ""));
}

export async function giveBiometricConsent(formData: FormData) {
  const locale = readLocale(formData);
  const back = String(formData.get("back") ?? `/${locale}/events`);
  const safeBack = back.startsWith(`/${locale}/events/`) ? back : `/${locale}/events`;
  if (formData.get("agree") !== "on") redirect(`${safeBack}?consent=required`);
  const supabase = await createClient();
  await supabase.rpc("record_biometric_consent");
  revalidatePath(safeBack); // the page must re-render without the consent form
  redirect(safeBack);
}

export async function withdrawBiometricConsent(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  await supabase.rpc("withdraw_biometric_consent");
  revalidatePath(`/${locale}/account`);
}
