import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireApprovedPhotographer } from "@/lib/auth/photographer";
import { getEvent, getMyEventRole, listPhotos } from "@/lib/events/queries";
import type { EventErrorKey } from "@/lib/events/actions";
import { PageIntro } from "@/components/layout/page-intro";
import { EventForm } from "@/components/events/event-form";
import { Uploader } from "@/components/events/uploader";
import { PhotoTable } from "@/components/events/photo-table";
import { textLink } from "@/components/ui/styles";

const ERROR_KEYS: EventErrorKey[] = ["invalidName", "invalidDate", "forbidden", "notFound", "notPhotographer", "invalidPrice", "generic"];

export default async function StudioEventPage({ params, searchParams }: PageProps<"/[locale]/photographer/events/[id]">) {
  const { locale: rawLocale, id } = await params;
  const locale = resolveLocale(rawLocale);
  const { user } = await requireApprovedPhotographer(locale, `/${locale}/photographer/events/${id}`);
  const sp = await searchParams;
  const page = Math.max(0, Number(sp.page) || 0);
  const t = getDictionary(locale).events;

  // RLS hides events this photographer is not part of, so this 404s for them.
  const event = await getEvent(id);
  if (!event) notFound();
  const [role, photos] = await Promise.all([getMyEventRole(id, user.id), listPhotos(id, page)]);
  const back = `/${locale}/photographer/events/${id}`;
  const errorKey = ERROR_KEYS.find((k) => k === sp.error);

  return (
    <PageIntro title={event.name_mn} lead={[event.event_date, event.location, t.status[event.status]].filter(Boolean).join(" · ")}>
      <Link href={`/${locale}/photographer/events`} className={`${textLink} w-fit text-sm`}>← {t.back}</Link>
      {errorKey && <p role="alert" className="text-sm text-red-700">{t.errors[errorKey]}</p>}

      {event.status !== "archived" && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-950">{t.upload.title}</h2>
          <Uploader eventId={id} defaultPrice={10000} t={t.upload} />
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-950">{t.photos.mine}</h2>
        <PhotoTable locale={locale} t={t} rows={photos.rows} total={photos.total} page={page} back={back} showOwner={false} />
      </section>

      {role === "owner" && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-950">{t.details}</h2>
          <EventForm locale={locale} t={t} base="photographer" event={event} back={back} />
        </section>
      )}
    </PageIntro>
  );
}
