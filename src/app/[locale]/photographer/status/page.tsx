import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireUser } from "@/lib/auth/session";
import { canSellPhotos } from "@/lib/auth/roles";
import { getLatestApplication, getPhotographerProfile } from "@/lib/auth/photographer";
import { PageIntro } from "@/components/layout/page-intro";
import { primaryButton } from "@/components/ui/styles";
import { formatDate } from "@/lib/format";

const tone = {
  none: "border-zinc-200 bg-white",
  pending: "border-amber-200 bg-amber-50",
  approved: "border-emerald-200 bg-emerald-50",
  rejected: "border-zinc-300 bg-white",
  suspended: "border-red-200 bg-red-50",
} as const;

export default async function StatusPage({ params }: PageProps<"/[locale]/photographer/status">) {
  const locale = resolveLocale((await params).locale);
  const user = await requireUser(locale, `/${locale}/photographer/status`);
  const [profile, application] = await Promise.all([getPhotographerProfile(user.id), getLatestApplication(user.id)]);
  const t = getDictionary(locale).photographer;

  const state = profile?.status ?? "none";
  const copy = t.status[state];
  const canSell = canSellPhotos(user.profile, profile?.status);

  return (
    <PageIntro title={t.statusTitle}>
      <div className={`flex max-w-xl flex-col gap-3 rounded-2xl border p-6 ${tone[state]}`}>
        <h2 className="text-lg font-semibold text-zinc-950">{copy.title}</h2>
        <p className="leading-relaxed text-zinc-700">{copy.body}</p>
        {application && (
          <p className="text-sm text-zinc-500">
            {t.submittedAt}: {formatDate(application.created_at, locale)}
          </p>
        )}
        {state === "rejected" && application?.review_note && (
          <p className="text-sm text-zinc-700">
            <span className="font-medium">{t.reviewNote}:</span> {application.review_note}
          </p>
        )}
      </div>

      {canSell && <Link href={`/${locale}/photographer`} className={`${primaryButton} w-fit`}>{t.goDashboard}</Link>}
      {state === "none" && <Link href={`/${locale}/photographer/apply`} className={`${primaryButton} w-fit`}>{t.applyCta}</Link>}
      {state === "rejected" && <Link href={`/${locale}/photographer/apply`} className={`${primaryButton} w-fit`}>{t.applyAgain}</Link>}
    </PageIntro>
  );
}
