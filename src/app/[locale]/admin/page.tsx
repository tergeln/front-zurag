import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireRole } from "@/lib/auth/session";
import { PageIntro } from "@/components/layout/page-intro";

export default async function AdminPage({ params }: PageProps<"/[locale]/admin">) {
  const locale = resolveLocale((await params).locale);
  await requireRole(locale, `/${locale}/admin`, "admin");
  const t = getDictionary(locale).dashboard;

  return (
    <PageIntro title={t.adminTitle} lead={t.adminLead}>
      <p className="text-sm text-zinc-500">{t.comingNext}</p>
    </PageIntro>
  );
}
