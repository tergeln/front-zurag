import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCurrentUser } from "@/lib/auth/session";
import { resolveLocale } from "@/i18n/resolve";
import { AuthForm } from "../auth-form";
import { AuthShell } from "../auth-shell";

export default async function SignupPage({ params }: PageProps<"/[locale]/signup">) {
  const locale = resolveLocale((await params).locale);
  if (await getCurrentUser()) redirect(`/${locale}/account`);

  const t = getDictionary(locale).auth;
  return (
    <AuthShell title={t.signupTitle} lead={t.signupLead}>
      <AuthForm mode="signup" locale={locale} t={t} />
    </AuthShell>
  );
}
