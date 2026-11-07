"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import { safeNextPath } from "@/lib/auth/roles";
import type { Dictionary } from "@/i18n/dictionaries/mn";

export type AuthErrorKey = keyof Dictionary["auth"]["errors"];
export type AuthState = { error?: AuthErrorKey; sentTo?: string; email?: string; fullName?: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readLocale(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? "");
  return isLocale(value) ? value : defaultLocale;
}

function mapError(code: string | undefined): AuthErrorKey {
  switch (code) {
    case "invalid_credentials":
      return "invalid";
    case "email_not_confirmed":
      return "emailNotConfirmed";
    case "weak_password":
      return "weakPassword";
    case "user_already_exists":
    case "email_exists":
      return "exists";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "rateLimit";
    default:
      return "generic";
  }
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const locale = readLocale(formData);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!EMAIL_RE.test(email) || !password) return { error: "invalid", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: mapError(error.code), email };

  redirect(safeNextPath(String(formData.get("next") ?? ""), `/${locale}/account`));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const locale = readLocale(formData);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim().slice(0, 120);
  if (!EMAIL_RE.test(email)) return { error: "invalidEmail", email, fullName };
  if (password.length < 8) return { error: "weakPassword", email, fullName };

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Only name and locale are read from metadata. Role is always 'customer' (see migration).
      data: { full_name: fullName, locale },
      emailRedirectTo: `${origin}/auth/callback?next=/${locale}/account`,
    },
  });
  if (error) return { error: mapError(error.code), email, fullName };

  // Email confirmation is off: signed in straight away.
  if (data.session) redirect(`/${locale}/account`);
  // Email confirmation is on: ask the user to check their inbox.
  return { sentTo: email };
}

export async function signOut(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}
