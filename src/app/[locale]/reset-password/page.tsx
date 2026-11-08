import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireUser } from "@/lib/auth/session";
import { AuthShell } from "../(auth)/auth-shell";
import { NewPasswordForm } from "../(auth)/password-forms";

/** Reached from the reset email (signed in by /auth/callback) or from "Change password" on the account page. */
export default async function ResetPasswordPage({ params }: PageProps<"/[locale]/reset-password">) {
  const locale = resolveLocale((await params).locale);
  await requireUser(locale, `/${locale}/reset-password`);
  const t = getDictionary(locale).auth;
  return (
    <AuthShell title={t.resetTitle} lead={t.resetLead}>
      <NewPasswordForm locale={locale} t={t} />
    </AuthShell>
  );
}
