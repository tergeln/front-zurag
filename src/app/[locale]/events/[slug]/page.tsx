import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { getPublicEvent } from "@/lib/public/queries";
import { unlockEvent } from "@/lib/public/actions";
import { PageIntro } from "@/components/layout/page-intro";
import { inputClass, labelClass, primaryButton } from "@/components/ui/styles";

// No gallery here: customers find their photos only through selfie search.
export default async function EventPage({ params, searchParams }: PageProps<"/[locale]/events/[slug]">) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const sp = await searchParams;
  const t = getDictionary(locale).gallery;

  const event = await getPublicEvent(slug);
  if (!event) notFound();
  const name = locale === "en" && event.name_en ? event.name_en : event.name_mn;
  const meta = [event.event_date, event.location].filter(Boolean).join(" · ");

  if (event.locked) {
    return (
      <PageIntro title={name} lead={meta}>
        <form action={unlockEvent} className="flex max-w-md flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="eventId" value={event.id} />
          <h2 className="text-lg font-semibold text-zinc-950">{t.locked.title}</h2>
          <p className="text-zinc-600">{t.locked.body}</p>
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className={labelClass}>{t.locked.code}</label>
            <input id="code" name="code" required maxLength={64} autoComplete="off" className={inputClass} />
          </div>
          {sp.code === "wrong" && <p role="alert" className="text-sm text-red-700">{t.locked.wrong}</p>}
          <button type="submit" className={`${primaryButton} w-fit`}>{t.locked.submit}</button>
        </form>
      </PageIntro>
    );
  }

  const description = locale === "en" && event.description_en ? event.description_en : event.description_mn;

  return (
    <PageIntro title={name} lead={meta}>
      {description && <p className="max-w-[65ch] whitespace-pre-line leading-relaxed text-zinc-700">{description}</p>}
      {event.face_search_enabled ? (
        <div className="flex max-w-xl flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">{t.photos.replace("{n}", String(event.photo_count))}</p>
          <Link href={`/${locale}/events/${slug}/find`} className={`${primaryButton} w-fit px-5 py-3`}>{t.findCta}</Link>
          <p className="text-sm leading-relaxed text-zinc-600">{t.privateNote}</p>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600">{t.noFaceSearch}</p>
      )}
    </PageIntro>
  );
}
