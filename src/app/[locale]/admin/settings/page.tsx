import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireRole } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings";
import { bpToPercent } from "@/lib/money";
import { PageIntro } from "@/components/layout/page-intro";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage({ params }: PageProps<"/[locale]/admin/settings">) {
  const locale = resolveLocale((await params).locale);
  await requireRole(locale, `/${locale}/admin/settings`, "admin");
  const settings = await getSettings();
  const dict = getDictionary(locale);

  return (
    <PageIntro title={dict.admin.settings.title} lead={dict.admin.settings.lead}>
      <SettingsForm
        locale={locale}
        t={dict.admin.settings}
        errors={dict.admin.errors}
        commission={bpToPercent(settings.commissionBp)}
        retention={settings.retentionDays}
      />
    </PageIntro>
  );
}
