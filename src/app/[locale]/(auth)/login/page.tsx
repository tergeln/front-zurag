import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCurrentUser } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/roles";
import { resolveLocale } from "@/i18n/resolve";
import { AuthForm } from "../auth-form";
import { AuthShell } from "../auth-shell";

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const locale = resolveLocale((await params).locale);
  const { next, error } = await searchParams;
  const nextPath = safeNextPath(typeof next === "string" ? next : undefined, `/${locale}/account`);

  if (await getCurrentUser()) redirect(nextPath);

  const t = getDictionary(locale).auth;
  return (
    <AuthShell title={t.loginTitle} lead={t.loginLead}>
      <AuthForm mode="login" locale={locale} t={t} next={nextPath} initialError={error === "link" ? "link" : undefined} />
    </AuthShell>
  );
}
