import "server-only";
import { cache } from "react";
import { forbidden, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/i18n/config";
import { hasRole, type Profile, type Role } from "./roles";

export type CurrentUser = { id: string; email: string | undefined; profile: Profile | null };

/** The signed-in user and their profile, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  // getUser() verifies the token with Supabase Auth, so it is safe for authorization.
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("role, status, full_name, phone, locale")
    .eq("id", data.user.id)
    .maybeSingle<Profile>();

  return { id: data.user.id, email: data.user.email, profile: profile ?? null };
});

/** Redirects to login when nobody is signed in. */
export async function requireUser(locale: Locale, returnTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

/** Signed in AND active AND one of `allowed` roles, otherwise 403. Use in every protected page and API route. */
export async function requireRole(locale: Locale, returnTo: string, ...allowed: Role[]): Promise<CurrentUser> {
  const user = await requireUser(locale, returnTo);
  if (!hasRole(user.profile, allowed)) forbidden();
  return user;
}
