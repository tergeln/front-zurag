import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireUser } from "@/lib/auth/session";
import { PageIntro } from "@/components/layout/page-intro";
import { primaryButton } from "@/components/ui/styles";
import { EmailVerify } from "@/components/account/email-verify";
import { acceptInvitation } from "../../actions";

export default async function InvitePage({ params, searchParams }: PageProps<"/[locale]/photographer/invite/[token]">) {
  const { locale: rawLocale, token } = await params;
  const locale = resolveLocale(rawLocale);
  const { error } = await searchParams;
  const user = await requireUser(locale, `/${locale}/photographer/invite/${encodeURIComponent(token)}`);
  const dict = getDictionary(locale);
  const t = dict.photographer.invite;

  return (
    <PageIntro title={t.title} lead={t.body}>
      <p className="text-sm text-zinc-500">{user.email}</p>
      {error === "invalid" && <p role="alert" className="max-w-xl text-sm text-red-700">{t.invalid}</p>}
      {error === "wrongAccount" && <p role="alert" className="max-w-xl text-sm text-red-700">{t.wrongAccount}</p>}
      {error === "emailNotVerified" && <p role="alert" className="max-w-xl text-sm text-red-700">{t.emailNotVerified}</p>}
      {/* Photographers must prove they own their email before accepting. */}
      {!user.profile?.email_verified_at ? (
        <EmailVerify locale={locale} email={user.email ?? ""} t={dict.verifyEmail} />
      ) : (
        <form action={acceptInvitation}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="token" value={token} />
          <button type="submit" className={primaryButton}>{t.accept}</button>
        </form>
      )}
    </PageIntro>
  );
}
