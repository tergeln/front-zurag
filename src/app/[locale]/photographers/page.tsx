import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { listPublicPhotographers } from "@/lib/public/queries";
import { PageIntro } from "@/components/layout/page-intro";
import { textLink } from "@/components/ui/styles";

export default async function PhotographersPage({ params }: PageProps<"/[locale]/photographers">) {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).photographers;
  const people = await listPublicPhotographers();

  return (
    <PageIntro title={t.title} lead={t.lead}>
      {people.length ? (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => (
            <li key={p.slug}>
              <Link href={`/${locale}/photographers/${p.slug}`} className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition-colors duration-200 hover:border-zinc-400">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold tracking-tight text-zinc-950">{p.display_name}</h2>
                  <p className="text-sm text-zinc-500">{t.photos.replace("{n}", String(p.photo_count))}</p>
                  {p.bio && <p className="line-clamp-2 text-sm leading-relaxed text-zinc-600">{p.bio}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600">{t.empty}</p>
      )}
      <Link href={`/${locale}/photographer/apply`} className={`${textLink} w-fit text-sm`}>{t.join}</Link>
    </PageIntro>
  );
}
