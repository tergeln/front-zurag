import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { setAccessCode } from "@/lib/events/actions";
import type { EventRow } from "@/lib/events/queries";
import { inputClass, labelClass, secondaryButton } from "@/components/ui/styles";

/** Shown only for private events. */
export function AccessCodeForm({ locale, t, event, back }: { locale: Locale; t: Dictionary["events"]["accessCode"]; event: EventRow; back: string }) {
  if (event.visibility !== "private") return null;
  return (
    <form action={setAccessCode} className="flex max-w-2xl flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="eventId" value={event.id} />
      <input type="hidden" name="back" value={back} />
      <h2 className="text-lg font-semibold text-zinc-950">{t.title}</h2>
      <p className="text-sm leading-relaxed text-zinc-600">{t.lead}</p>
      <label htmlFor="access-code" className={labelClass}>{t.label}</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input id="access-code" name="code" maxLength={64} autoComplete="off" className={inputClass} />
        <button type="submit" className={secondaryButton}>{t.save}</button>
      </div>
    </form>
  );
}
