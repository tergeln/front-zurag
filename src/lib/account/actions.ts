"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { defaultLocale, isLocale } from "@/i18n/config";

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
