import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireApprovedPhotographer } from "@/lib/auth/photographer";
import { PageIntro } from "@/components/layout/page-intro";

export default async function PhotographerPage({ params }: PageProps<"/[locale]/photographer">) {
  const locale = resolveLocale((await params).locale);
  // Only approved photographers. Pending, rejected and suspended go to the status page.
  const { profile } = await requireApprovedPhotographer(locale, `/${locale}/photographer`);
  const t = getDictionary(locale).dashboard;

  return (
    <PageIntro title={t.photographerTitle} lead={t.photographerLead}>
      <p className="text-zinc-800">{profile.display_name}</p>
      <p className="text-sm text-zinc-500">{t.comingNext}</p>
    </PageIntro>
  );
}
