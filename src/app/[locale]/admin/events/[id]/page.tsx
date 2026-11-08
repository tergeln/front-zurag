import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireRole } from "@/lib/auth/session";
import { getEvent, getParticipants, listPhotos } from "@/lib/events/queries";
import { addParticipant, removeParticipant, type EventErrorKey } from "@/lib/events/actions";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { PageIntro } from "@/components/layout/page-intro";
import { EventForm } from "@/components/events/event-form";
import { Uploader } from "@/components/events/uploader";
import { PhotoTable } from "@/components/events/photo-table";
import { FaceSearchToggle } from "@/components/events/face-search-toggle";
import { AccessCodeForm } from "@/components/events/access-code-form";
import { inputClass, secondaryButton, textLink } from "@/components/ui/styles";

const ERROR_KEYS: EventErrorKey[] = ["invalidName", "invalidDate", "forbidden", "notFound", "notPhotographer", "invalidPrice", "needAttestation", "invalidCode", "faceSearchRequired", "unpublishFirst", "generic"];

export default async function AdminEventPage({ params, searchParams }: PageProps<"/[locale]/admin/events/[id]">) {
  const { locale: rawLocale, id } = await params;
  const locale = resolveLocale(rawLocale);
  await requireRole(locale, `/${locale}/admin/events/${id}`, "admin");
  const sp = await searchParams;
  const page = Math.max(0, Number(sp.page) || 0);
  const t = getDictionary(locale).events;

  const event = await getEvent(id);
  if (!event) notFound();
  const [participants, photos] = await Promise.all([getParticipants(id), listPhotos(id, page)]);
  const back = `/${locale}/admin/events/${id}`;
  const errorKey = ERROR_KEYS.find((k) => k === sp.error);

  return (
    <PageIntro title={event.name_mn} lead={[event.event_date, event.location].filter(Boolean).join(" · ")}>
      <Link href={`/${locale}/admin/events`} className={`${textLink} w-fit text-sm`}>← {t.back}</Link>
      {errorKey && <p role="alert" className="text-sm text-red-700">{t.errors[errorKey]}</p>}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-950">{t.upload.title}</h2>
        <Uploader eventId={id} defaultPrice={10000} t={t.upload} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-950">{t.photos.title}</h2>
        <PhotoTable locale={locale} t={t} rows={photos.rows} total={photos.total} page={page} back={back} showOwner />
      </section>

      <section className="flex max-w-2xl flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-zinc-950">{t.participants.title}</h2>
          <p className="text-zinc-600">{t.participants.lead}</p>
        </div>
        {participants.length ? (
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200 text-sm">
            {participants.map((p) => (
              <li key={p.user_id} className="flex items-center gap-4 py-3">
                <span className="flex-1 text-zinc-900">{p.user?.full_name ?? p.user_id}</span>
                <span className="text-zinc-500">{p.role === "owner" ? t.participants.owner : t.participants.contributor}</span>
                <form action={removeParticipant}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="eventId" value={id} />
                  <input type="hidden" name="userId" value={p.user_id} />
                  <input type="hidden" name="back" value={back} />
                  <ConfirmButton message={t.participants.removeConfirm} className="text-zinc-600 underline underline-offset-4 hover:text-red-700">{t.participants.remove}</ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">{t.participants.empty}</p>
        )}
        <form action={addParticipant} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="eventId" value={id} />
          <input type="hidden" name="back" value={back} />
          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor="participant-email" className="text-sm font-medium text-zinc-800">{t.participants.email}</label>
            <input id="participant-email" name="email" type="email" required className={inputClass} />
          </div>
          <button type="submit" className={secondaryButton}>{t.participants.add}</button>
        </form>
      </section>

      <FaceSearchToggle locale={locale} t={t.faceSearch} event={event} back={back} />
      <AccessCodeForm locale={locale} t={t.accessCode} event={event} back={back} />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-950">{t.details}</h2>
        {/* key: rebuild the form after each save so it shows the saved values */}
        <EventForm key={event.updated_at} locale={locale} t={t} base="admin" event={event} back={back} />
      </section>
    </PageIntro>
  );
}
