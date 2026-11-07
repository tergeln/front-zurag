import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireApprovedPhotographer } from "@/lib/auth/photographer";
import { getSettings } from "@/lib/settings";
import { bpToPercent, formatMnt, splitSale } from "@/lib/money";
import { PageIntro } from "@/components/layout/page-intro";
import { textLink } from "@/components/ui/styles";

export default async function StudioOverviewPage({ params }: PageProps<"/[locale]/photographer">) {
  const locale = resolveLocale((await params).locale);
  // Only approved photographers. Pending, rejected and suspended go to the status page.
  const { profile } = await requireApprovedPhotographer(locale, `/${locale}/photographer`);
  const { commissionBp } = await getSettings();
  const dict = getDictionary(locale);
  const t = dict.studio;
  const example = splitSale(10000, commissionBp);

  return (
    <PageIntro title={dict.dashboard.photographerTitle} lead={profile.display_name}>
      <div className="grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-[3fr_2fr]">
        <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-950">{t.commissionTitle}</h2>
          <p className="leading-relaxed text-zinc-700">
            {t.commissionBody.replace("{platform}", bpToPercent(commissionBp)).replace("{you}", bpToPercent(10000 - commissionBp))}
          </p>
          <p className="text-sm text-zinc-500">{t.commissionExample.replace("{earn}", formatMnt(example.photographer))}</p>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-semibold text-zinc-950">{t.profileTitle}</h2>
            <Link href={`/${locale}/photographer/profile`} className={`${textLink} text-sm`}>{t.edit}</Link>
          </div>
          <p className="text-zinc-900">{profile.display_name}</p>
          <p className="text-sm text-zinc-500">{[profile.contact_email, profile.phone].filter(Boolean).join(" · ")}</p>
          <p className="text-sm text-zinc-500">
            {profile.portfolio_urls.length ? `${dict.photographer.portfolio}: ${profile.portfolio_urls.length}` : t.noPortfolio}
          </p>
        </section>
      </div>

      <section className="flex max-w-4xl flex-col gap-3 rounded-2xl border border-dashed border-zinc-300 p-6">
        <h2 className="text-sm font-medium text-zinc-500">{t.upcomingTitle}</h2>
        <ul className="grid grid-cols-1 gap-2 text-zinc-700 sm:grid-cols-2">
          {t.upcoming.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </PageIntro>
  );
}
