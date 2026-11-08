import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { AuthShell } from "../auth-shell";
import { ForgotPasswordForm } from "../password-forms";

export default async function ForgotPasswordPage({ params }: PageProps<"/[locale]/forgot-password">) {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).auth;
  return (
    <AuthShell title={t.forgotTitle} lead={t.forgotLead}>
      <ForgotPasswordForm locale={locale} t={t} />
    </AuthShell>
  );
}
