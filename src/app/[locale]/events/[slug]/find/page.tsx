import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireUser } from "@/lib/auth/session";
import { getCartPhotoIds, getPublicEvent, hasBiometricConsent } from "@/lib/public/queries";
import { giveBiometricConsent } from "@/lib/public/actions";
import { PageIntro } from "@/components/layout/page-intro";
import { primaryButton, textLink } from "@/components/ui/styles";
import { SelfieSearch } from "./selfie-search";

export default async function FindPage({ params, searchParams }: PageProps<"/[locale]/events/[slug]/find">) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const self = `/${locale}/events/${slug}/find`;
  await requireUser(locale, self);
  const sp = await searchParams;
  const dict = getDictionary(locale);
  const t = dict.find;

  const event = await getPublicEvent(slug);
  if (!event) notFound();
  const eventHref = `/${locale}/events/${slug}`;
  if (event.locked) redirect(eventHref);
  const name = locale === "en" && event.name_en ? event.name_en : event.name_mn;
  const back = <Link href={eventHref} className={`${textLink} w-fit text-sm`}>← {name}</Link>;

  if (!event.face_search_enabled) {
    return (
      <PageIntro title={t.title}>
        {back}
        <p className="text-zinc-600">{t.errors.search_disabled}</p>
      </PageIntro>
    );
  }

  if (!(await hasBiometricConsent())) {
    return (
      <PageIntro title={t.title} lead={name}>
        {back}
        <form action={giveBiometricConsent} className="flex max-w-xl flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="back" value={self} />
          <h2 className="text-lg font-semibold text-zinc-950">{t.consentTitle}</h2>
          <ul className="flex list-disc flex-col gap-2 pl-5 leading-relaxed text-zinc-700">
            {t.consentPoints.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <label className="flex items-start gap-3 text-sm leading-relaxed text-zinc-800">
            <input type="checkbox" name="agree" required className="mt-1 size-4 accent-zinc-900" />
            <span>{t.consentCheck}</span>
          </label>
          {sp.consent === "required" && <p role="alert" className="text-sm text-red-700">{t.consentRequired}</p>}
          <button type="submit" className={`${primaryButton} w-fit`}>{t.consentSubmit}</button>
        </form>
      </PageIntro>
    );
  }

  const cart = await getCartPhotoIds();
  return (
    <PageIntro title={t.title} lead={t.lead}>
      {back}
      <SelfieSearch locale={locale} eventId={event.id} t={t} gallery={dict.gallery} cartIds={[...cart]} loginHref={`/${locale}/login`} />
    </PageIntro>
  );
}
