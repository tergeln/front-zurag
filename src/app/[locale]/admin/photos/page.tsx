import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireRole } from "@/lib/auth/session";
import { listAllPhotos, listEvents, parsePhotoStatus } from "@/lib/events/queries";
import type { EventErrorKey } from "@/lib/events/actions";
import { PageIntro } from "@/components/layout/page-intro";
import { PhotoTable } from "@/components/events/photo-table";
import { inputClass, labelClass, secondaryButton } from "@/components/ui/styles";

const ERROR_KEYS: EventErrorKey[] = ["forbidden", "invalidPrice", "generic"];

export default async function AdminPhotosPage({ params, searchParams }: PageProps<"/[locale]/admin/photos">) {
  const locale = resolveLocale((await params).locale);
  await requireRole(locale, `/${locale}/admin/photos`, "admin");
  const sp = await searchParams;
  const page = Math.max(0, Number(sp.page) || 0);
  const eventId = typeof sp.event === "string" && /^[0-9a-f-]{36}$/.test(sp.event) ? sp.event : undefined;
  const status = parsePhotoStatus(sp.status);
  const dict = getDictionary(locale);
  const t = dict.events;
  const a = dict.admin.photos;

  const [events, photos] = await Promise.all([listEvents(), listAllPhotos({ eventId, status }, page)]);
  const query = new URLSearchParams();
  if (eventId) query.set("event", eventId);
  if (status) query.set("status", status);
  const back = `/${locale}/admin/photos${query.size ? `?${query}` : ""}`;
  const errorKey = ERROR_KEYS.find((k) => k === sp.error);

  return (
    <PageIntro title={a.title} lead={a.lead}>
      <form className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="event" className={labelClass}>{t.photos.event}</label>
          <select id="event" name="event" defaultValue={eventId ?? ""} className={`${inputClass} w-64`}>
            <option value="">{a.allEvents}</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>{(locale === "en" && e.name_en) || e.name_mn}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="status" className={labelClass}>{t.photos.status}</label>
          <select id="status" name="status" defaultValue={status ?? ""} className={`${inputClass} w-48`}>
            <option value="">{a.allStatuses}</option>
            {(["ready", "hidden", "processing", "uploading", "failed"] as const).map((s) => (
              <option key={s} value={s}>{t.photos.statuses[s]}</option>
            ))}
          </select>
        </div>
        <button type="submit" className={secondaryButton}>{a.filter}</button>
      </form>

      {errorKey && <p role="alert" className="text-sm text-red-700">{t.errors[errorKey]}</p>}
      <PhotoTable locale={locale} t={t} rows={photos.rows} total={photos.total} page={page} back={back} showOwner showEvent />
    </PageIntro>
  );
}
