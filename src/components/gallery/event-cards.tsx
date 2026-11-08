import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";

type Card = { id: string; slug: string; name_mn: string; name_en: string | null; event_date: string; location: string | null; cover_photo_id: string | null; photo_count: number };

export function EventCards({ locale, t, events }: { locale: Locale; t: Dictionary["gallery"]; events: Card[] }) {
  return (
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
  );
}
