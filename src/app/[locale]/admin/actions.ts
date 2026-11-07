"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";

type AdminErrorKey = keyof Dictionary["admin"]["errors"];

function readLocale(formData: FormData): Locale {
  const v = String(formData.get("locale") ?? "");
  return isLocale(v) ? v : defaultLocale;
}

function errorKey(message: string): AdminErrorKey {
  if (message === "forbidden") return "forbidden";
  if (message === "not_open" || message === "not_photographer") return "notOpen";
  if (message === "invalid_email") return "invalidEmail";
  return "generic";
}

/** Every admin action re-checks the role here AND inside the database function. */
async function adminClient(locale: Locale, page: string) {
  await requireRole(locale, `/${locale}/admin/${page}`, "admin");
  return createClient();
}

export async function reviewApplication(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await adminClient(locale, "applications");
  const { error } = await supabase.rpc("review_photographer_application", {
    p_application_id: String(formData.get("applicationId") ?? ""),
    p_approve: formData.get("decision") === "approve",
    p_note: String(formData.get("note") ?? "").slice(0, 1000),
  });
  if (error) redirect(`/${locale}/admin/applications?error=${errorKey(error.message)}`);
  revalidatePath(`/${locale}/admin`, "layout");
}

export async function setPhotographerStatus(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await adminClient(locale, "photographers");
  const status = formData.get("status") === "suspended" ? "suspended" : "approved";
  const { error } = await supabase.rpc("set_photographer_status", {
    p_user_id: String(formData.get("userId") ?? ""),
    p_status: status,
  });
  if (error) redirect(`/${locale}/admin/photographers?error=${errorKey(error.message)}`);
  revalidatePath(`/${locale}/admin`, "layout");
}

export type InviteState = { link?: string; error?: AdminErrorKey } | undefined;

export async function createInvitation(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const locale = readLocale(formData);
  const supabase = await adminClient(locale, "photographers");
  const { data: token, error } = await supabase.rpc("create_photographer_invitation", {
    p_email: String(formData.get("email") ?? ""),
  });
  if (error || typeof token !== "string") return { error: errorKey(error?.message ?? "") };

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;
  revalidatePath(`/${locale}/admin/photographers`);
  return { link: `${origin}/${locale}/photographer/invite/${token}` };
}

export async function revokeInvitation(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await adminClient(locale, "photographers");
  const { error } = await supabase.rpc("revoke_photographer_invitation", {
    p_invitation_id: String(formData.get("invitationId") ?? ""),
  });
  if (error) redirect(`/${locale}/admin/photographers?error=${errorKey(error.message)}`);
  revalidatePath(`/${locale}/admin/photographers`);
}
