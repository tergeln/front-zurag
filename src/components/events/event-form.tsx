"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { inputClass, labelClass, primaryButton } from "@/components/ui/styles";
import { createEvent, updateEvent } from "@/lib/events/actions";
import type { EventRow } from "@/lib/events/queries";

type Props = {
  locale: Locale;
  t: Dictionary["events"];
  base: "admin" | "photographer";
  event?: EventRow; // edit mode when present
  back?: string;
};

export function EventForm({ locale, t, base, event, back }: Props) {
  const [state, action, pending] = useActionState(event ? updateEvent : createEvent, undefined);
  const f = t.fields;

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="base" value={base} />
      {event && <input type="hidden" name="eventId" value={event.id} />}
      {back && <input type="hidden" name="back" value={back} />}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="nameMn" className={labelClass}>{f.nameMn}</label>
          <input id="nameMn" name="nameMn" required minLength={2} maxLength={160} defaultValue={event?.name_mn} className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="nameEn" className={labelClass}>{f.nameEn}</label>
          <input id="nameEn" name="nameEn" maxLength={160} defaultValue={event?.name_en ?? ""} className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="eventDate" className={labelClass}>{f.date}</label>
          <input id="eventDate" name="eventDate" type="date" required defaultValue={event?.event_date} className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="location" className={labelClass}>{f.location}</label>
          <input id="location" name="location" maxLength={200} defaultValue={event?.location ?? ""} className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="visibility" className={labelClass}>{f.visibility}</label>
          <select id="visibility" name="visibility" defaultValue={event?.visibility ?? "public"} className={inputClass}>
            <option value="public">{t.visibility.public}</option>
            <option value="private">{t.visibility.private}</option>
          </select>
        </div>
        {event && (
          <div className="flex flex-col gap-2">
            <label htmlFor="status" className={labelClass}>{f.status}</label>
            <select id="status" name="status" defaultValue={event.status} className={inputClass}>
              <option value="draft">{t.status.draft}</option>
              <option value="published">{t.status.published}</option>
              <option value="archived">{t.status.archived}</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="descriptionMn" className={labelClass}>{f.descriptionMn}</label>
        <textarea id="descriptionMn" name="descriptionMn" rows={3} maxLength={4000} defaultValue={event?.description_mn ?? ""} className={inputClass} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="descriptionEn" className={labelClass}>{f.descriptionEn}</label>
        <textarea id="descriptionEn" name="descriptionEn" rows={3} maxLength={4000} defaultValue={event?.description_en ?? ""} className={inputClass} />
      </div>

      {state?.error && <p role="alert" className="text-sm text-red-700">{t.errors[state.error]}</p>}
      {state?.saved && <p role="status" className="text-sm text-emerald-700">{t.saved}</p>}

      <button type="submit" disabled={pending} className={`${primaryButton} w-fit`}>{event ? t.save : t.createSubmit}</button>
    </form>
  );
}
