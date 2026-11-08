import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { PageIntro } from "@/components/layout/page-intro";
import { textLink } from "@/components/ui/styles";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/site";

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).contact;
  return (
    <PageIntro title={t.title} lead={t.lead}>
      {CONTACT_EMAIL || CONTACT_PHONE ? (
        <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-8 gap-y-3 border-t border-zinc-200 pt-6 text-[15px]">
          {CONTACT_EMAIL && (
            <>
              <dt className="text-zinc-500">{t.email}</dt>
              <dd><a href={`mailto:${CONTACT_EMAIL}`} className={textLink}>{CONTACT_EMAIL}</a></dd>
            </>
          )}
          {CONTACT_PHONE && (
            <>
              <dt className="text-zinc-500">{t.phone}</dt>
              <dd><a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className={textLink}>{CONTACT_PHONE}</a></dd>
            </>
          )}
        </dl>
      ) : (
        <p className="max-w-[60ch] rounded-2xl border border-dashed border-zinc-300 p-6 leading-relaxed text-zinc-600">{t.notSet}</p>
      )}
      <ul className="flex max-w-[60ch] flex-col gap-2 border-t border-zinc-200 pt-6 text-[15px] text-zinc-700">
        <li>{t.photographersHint} <Link href={`/${locale}/photographer/apply`} className={textLink}>{t.applyLink}</Link></li>
        <li>{t.removalHint}</li>
      </ul>
    </PageIntro>
  );
}
