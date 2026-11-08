import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { getPublicPhotographer, listPublicPhotographerEvents } from "@/lib/public/queries";
import { PageIntro } from "@/components/layout/page-intro";
import { EventCards } from "@/components/gallery/event-cards";
import { textLink } from "@/components/ui/styles";

export async function generateMetadata({ params }: PageProps<"/[locale]/photographers/[slug]">): Promise<Metadata> {
  const p = await getPublicPhotographer((await params).slug);
  return p ? { title: p.display_name } : {};
}

export default async function PhotographerPage({ params }: PageProps<"/[locale]/photographers/[slug]">) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const t = dict.photographers;

  const [person, events] = await Promise.all([getPublicPhotographer(slug), listPublicPhotographerEvents(slug)]);
  if (!person) notFound();
  // Only https links are accepted at application time; checked again here before rendering.
  const links = person.portfolio_urls.filter((u) => /^https:\/\//.test(u));

  return (
    <PageIntro title={person.display_name}>
      <Link href={`/${locale}/photographers`} className={`${textLink} -mt-4 w-fit text-sm`}>← {t.all}</Link>
      {person.bio && <p className="max-w-[65ch] whitespace-pre-line leading-relaxed text-zinc-700">{person.bio}</p>}
      {links.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-zinc-500">{t.portfolio}</h2>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {links.map((u) => (
              <li key={u}>
                <a href={u} target="_blank" rel="noopener noreferrer nofollow" className={textLink}>{new URL(u).hostname.replace(/^www\./, "")}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <section className="flex flex-col gap-4 border-t border-zinc-200 pt-6">
        <h2 className="text-lg font-semibold text-zinc-950">{t.events}</h2>
        {events.length ? (
          <EventCards locale={locale} t={dict.gallery} events={events} />
        ) : (
          <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600">{t.noEvents}</p>
        )}
      </section>
    </PageIntro>
  );
}
