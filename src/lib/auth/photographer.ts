import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/i18n/config";
import { getCurrentUser, requireUser, type CurrentUser } from "./session";
import { canSellPhotos, type PhotographerStatus } from "./roles";

export type PhotographerProfile = {
  user_id: string;
  display_name: string;
  bio: string | null;
  contact_email: string | null;
  phone: string | null;
  portfolio_urls: string[];
  status: PhotographerStatus;
  source: "application" | "invitation";
  approved_at: string | null;
};

export type Application = {
  id: string;
  status: "submitted" | "approved" | "rejected";
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

/** The signed-in user's photographer profile (any status), or null. */
export const getPhotographerProfile = cache(async (userId: string): Promise<PhotographerProfile | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("photographer_profiles").select("*").eq("user_id", userId).maybeSingle<PhotographerProfile>();
  return data ?? null;
});

export async function getLatestApplication(userId: string): Promise<Application | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("photographer_applications")
    .select("id, status, review_note, created_at, reviewed_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Application>();
  return data ?? null;
}

/** For pages: approved photographers pass; everyone else signed in is sent to the application status page. */
export async function requireApprovedPhotographer(locale: Locale, returnTo: string): Promise<{ user: CurrentUser; profile: PhotographerProfile }> {
  const user = await requireUser(locale, returnTo);
  const profile = await getPhotographerProfile(user.id);
  if (!profile || !canSellPhotos(user.profile, profile.status)) redirect(`/${locale}/photographer/status`);
  return { user, profile };
}

/** For API routes: returns the approved photographer, or null (caller responds 403). */
export async function getApprovedPhotographer(): Promise<{ user: CurrentUser; profile: PhotographerProfile } | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await getPhotographerProfile(user.id);
  if (!profile || !canSellPhotos(user.profile, profile.status)) return null;
  return { user, profile };
}
