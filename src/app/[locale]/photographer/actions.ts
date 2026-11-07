"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { parsePortfolioUrls } from "@/lib/auth/roles";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";

export type ApplyErrorKey = keyof Dictionary["photographer"]["errors"];
export type ApplyState =
  | { error: ApplyErrorKey; values: Record<string, string> }
  | undefined;

function readLocale(formData: FormData): Locale {
  const v = String(formData.get("locale") ?? "");
  return isLocale(v) ? v : defaultLocale;
}

const RPC_ERRORS: Record<string, ApplyErrorKey> = {
  already_submitted: "alreadySubmitted",
  already_photographer: "alreadyPhotographer",
  invalid_name: "invalidName",
  invalid_bio: "invalidBio",
  invalid_portfolio: "invalidPortfolio",
};

export async function submitApplication(_prev: ApplyState, formData: FormData): Promise<ApplyState> {
  const locale = readLocale(formData);
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login?next=/${locale}/photographer/apply`);

  const values = {
    displayName: String(formData.get("displayName") ?? "").trim(),
    contactEmail: String(formData.get("contactEmail") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim(),
    portfolio: String(formData.get("portfolio") ?? ""),
  };

  if (values.displayName.length < 2 || values.displayName.length > 80) return { error: "invalidName", values };
  if (values.bio.length > 2000) return { error: "invalidBio", values };
  const urls = parsePortfolioUrls(values.portfolio);
  if (!urls) return { error: "invalidPortfolio", values };
  if (formData.get("consent") !== "on") return { error: "consent", values };

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_photographer_application", {
    p_display_name: values.displayName,
    p_bio: values.bio,
    p_contact_email: values.contactEmail.slice(0, 254),
    p_phone: values.phone.slice(0, 32),
    p_portfolio_urls: urls,
  });
  if (error) return { error: RPC_ERRORS[error.message] ?? "generic", values };

  redirect(`/${locale}/photographer/status`);
}

export type ProfileState = { error?: ApplyErrorKey; values?: Record<string, string>; saved?: boolean } | undefined;

/** Approved photographers edit their public profile. The database function re-checks status. */
export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const locale = readLocale(formData);
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login?next=/${locale}/photographer/profile`);

  const values = {
    displayName: String(formData.get("displayName") ?? "").trim(),
    contactEmail: String(formData.get("contactEmail") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim(),
    portfolio: String(formData.get("portfolio") ?? ""),
  };
  if (values.displayName.length < 2 || values.displayName.length > 80) return { error: "invalidName", values };
  if (values.bio.length > 2000) return { error: "invalidBio", values };
  // Unlike the application, the portfolio may be emptied here.
  const urls = values.portfolio.trim() === "" ? [] : parsePortfolioUrls(values.portfolio);
  if (!urls) return { error: "invalidPortfolio", values };

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_photographer_profile", {
    p_display_name: values.displayName,
    p_bio: values.bio,
    p_contact_email: values.contactEmail.slice(0, 254),
    p_phone: values.phone.slice(0, 32),
    p_portfolio_urls: urls,
  });
  if (error) return { error: RPC_ERRORS[error.message] ?? "generic", values };

  revalidatePath(`/${locale}/photographer`, "layout");
  return { saved: true };
}

export async function acceptInvitation(formData: FormData) {
  const locale = readLocale(formData);
  const token = String(formData.get("token") ?? "");
  const back = `/${locale}/photographer/invite/${encodeURIComponent(token)}`;

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login?next=${encodeURIComponent(back)}`);

  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_photographer_invitation", { p_token: token });
  if (error) redirect(`${back}?error=${error.message === "wrong_account" ? "wrongAccount" : "invalid"}`);

  redirect(`/${locale}/photographer`);
}
