import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { setFaceSearch } from "@/lib/events/actions";
import type { EventRow } from "@/lib/events/queries";
import { primaryButton, secondaryButton } from "@/components/ui/styles";

export function FaceSearchToggle({ locale, t, event, back }: { locale: Locale; t: Dictionary["events"]["faceSearch"]; event: EventRow; back: string }) {
  const on = event.face_search_enabled;
  return (
    <form action={setFaceSearch} className="flex max-w-2xl flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="eventId" value={event.id} />
      <input type="hidden" name="back" value={back} />
      <input type="hidden" name="enabled" value={on ? "false" : "true"} />
      <h2 className="text-lg font-semibold text-zinc-950">{t.title}</h2>
      <p className={on ? "text-emerald-700" : "text-zinc-600"}>{on ? t.on : t.off}</p>
      {!on && (
        <label className="flex items-start gap-3 text-sm leading-relaxed text-zinc-700">
          <input type="checkbox" name="attestation" required className="mt-1 size-4 accent-zinc-900" />
          <span>{t.attestation}</span>
        </label>
      )}
      <button type="submit" className={`${on ? secondaryButton : primaryButton} w-fit`}>{on ? t.disable : t.enable}</button>
    </form>
  );
}
