import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCurrentUser } from "@/lib/auth/session";
import { homePath, safeNextPath } from "@/lib/auth/roles";
import { resolveLocale } from "@/i18n/resolve";
import { AuthForm } from "../auth-form";
import { AuthShell } from "../auth-shell";

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const locale = resolveLocale((await params).locale);
  const { next, error } = await searchParams;
  // Only an explicitly requested page is passed on; otherwise each role goes to its own home.
  const nextPath = typeof next === "string" ? safeNextPath(next, "") || undefined : undefined;

  const user = await getCurrentUser();
  if (user) redirect(nextPath ?? homePath(user.profile?.role, locale));

  const t = getDictionary(locale).auth;
  return (
    <AuthShell title={t.loginTitle} lead={t.loginLead}>
      <AuthForm mode="login" locale={locale} t={t} next={nextPath} initialError={error === "link" ? "link" : undefined} />
    </AuthShell>
  );
}
