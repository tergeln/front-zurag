"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { defaultLocale, isLocale } from "@/i18n/config";

// ---------------------------------------------------------------- password reset

/** Set while a reset email is pending, so the email link lands on the "new password" page. */
const RESET_COOKIE = "zurag_pw_reset"; // also read in app/auth/callback/route.ts

export type ResetRequestState = { sentTo?: string; error?: "invalidEmail" | "rateLimit" } | undefined;

/**
 * Sends Supabase's password-reset email. The answer is the same whether or not
 * the email has an account, so the form cannot be used to discover accounts.
 */
export async function requestPasswordReset(_prev: ResetRequestState, formData: FormData): Promise<ResetRequestState> {
  const v = String(formData.get("locale") ?? "");
  const locale = isLocale(v) ? v : defaultLocale;
  const email = String(formData.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "invalidEmail" };

  const h = await headers();
  const origin = process.env.PUBLIC_SITE_URL || h.get("origin") || `https://${h.get("host")}`;
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/${locale}/reset-password`,
  });
  if (error?.code === "over_email_send_rate_limit" || error?.code === "over_request_rate_limit") return { error: "rateLimit" };

  // The reset link only works in this browser (PKCE), so a cookie here is enough
  // to route it to the new-password page even if Supabase falls back to the Site URL.
  (await cookies()).set(RESET_COOKIE, "1", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 3600 });
  return { sentTo: email };
}

export type NewPasswordState = { error?: "weakPassword" | "mismatch" | "samePassword" | "generic"; done?: boolean } | undefined;

/** Signed-in users (including after the reset link) choose a new password. */
export async function setNewPassword(_prev: NewPasswordState, formData: FormData): Promise<NewPasswordState> {
  const v = String(formData.get("locale") ?? "");
  const locale = isLocale(v) ? v : defaultLocale;
  if (!(await getCurrentUser())) redirect(`/${locale}/login`);
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "weakPassword" };
  if (password !== String(formData.get("confirm") ?? "")) return { error: "mismatch" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.code === "same_password" ? "samePassword" : error.code === "weak_password" ? "weakPassword" : "generic" };
  (await cookies()).delete(RESET_COOKIE);
  return { done: true };
}

// ---------------------------------------------------------------- profile

export type ProfileState = { error?: "invalidName" | "invalidPhone" | "generic"; saved?: boolean } | undefined;

/** Name, phone and language. RLS and column grants allow only these columns, only on your own row. */
export async function updateMyProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const v = String(formData.get("locale") ?? "");
  const locale = isLocale(v) ? v : defaultLocale;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const lang = String(formData.get("language") ?? "");
  if (fullName.length > 120) return { error: "invalidName" };
  if (phone && !/^[+0-9 ()-]{6,32}$/.test(phone)) return { error: "invalidPhone" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ full_name: fullName || null, phone: phone || null, locale: isLocale(lang) ? lang : locale })
    .eq("id", user.id);
  if (error) return { error: "generic" };
  revalidatePath(`/${locale}`, "layout");
  return { saved: true };
}

/**
 * Account deletion:
 * 1. The database removes personal data and revokes rights (delete_my_account).
 * 2. Supabase Auth: the email is replaced and the login blocked, so the
 *    address is no longer stored and cannot sign in. The user id stays only
 *    as an anonymous reference in kept purchase records.
 */
export async function deleteMyAccount(formData: FormData) {
  const v = String(formData.get("locale") ?? "");
  const locale = isLocale(v) ? v : defaultLocale;
  const back = `/${locale}/account`;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  if (formData.get("confirm") !== "on") redirect(`${back}?delete=confirm_required`);

  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_my_account");
  if (error) {
    const known = ["admin_cannot_delete", "photographer_contact_admin"];
    redirect(`${back}?delete=${known.includes(error.message) ? error.message : "generic"}`);
  }

  const { error: authError } = await createAdminClient().auth.admin.updateUserById(user.id, {
    email: `deleted-${user.id}@deleted.invalid`,
    user_metadata: {},
    ban_duration: "876000h", // ~100 years
  });
  if (authError) console.error("auth anonymise failed", user.id, authError.message);

  await supabase.auth.signOut();
  redirect(`/${locale}`);
}
