import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireRole } from "@/lib/auth/session";
import { PageIntro } from "@/components/layout/page-intro";

export default async function PhotographerPage({ params }: PageProps<"/[locale]/photographer">) {
  const locale = resolveLocale((await params).locale);
  // Phase 2 adds the approval check (photographer_profiles.status = 'approved').
  await requireRole(locale, `/${locale}/photographer`, "photographer");
  const t = getDictionary(locale).dashboard;

  return (
    <PageIntro title={t.photographerTitle} lead={t.photographerLead}>
      <p className="text-sm text-zinc-500">{t.comingNext}</p>
    </PageIntro>
  );
}
