import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { listPublicEvents } from "@/lib/public/queries";
import { PageIntro } from "@/components/layout/page-intro";

export default async function EventsPage({ params }: PageProps<"/[locale]/events">) {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).gallery;
  const events = await listPublicEvents();

  return (
    <PageIntro title={t.title} lead={t.lead}>
      {events.length ? (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <li key={e.id}>
              <Link href={`/${locale}/events/${e.slug}`} className="group flex flex-col gap-3">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-200">
                  {e.cover_photo_id && (
                    // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived R2 URL via redirect
                    <img src={`/api/photos/${e.cover_photo_id}/image?variant=preview`} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold tracking-tight text-zinc-950">{locale === "en" && e.name_en ? e.name_en : e.name_mn}</h2>
                  <p className="text-sm text-zinc-500">
                    {[e.event_date, e.location, t.photos.replace("{n}", String(e.photo_count))].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600">{t.empty}</p>
      )}
    </PageIntro>
  );
}
