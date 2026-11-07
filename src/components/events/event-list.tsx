import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import type { EventRow } from "@/lib/events/queries";

const statusTone = { draft: "text-zinc-500", published: "text-emerald-700", archived: "text-zinc-400" } as const;

export function EventList({ events, locale, t, base }: { events: (EventRow & { photo_count: number })[]; locale: Locale; t: Dictionary["events"]; base: string }) {
  if (!events.length) return <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600">{t.empty}</p>;
  return (
    <ul className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
      {events.map((e) => (
        <li key={e.id}>
          <Link href={`${base}/${e.id}`} className="grid grid-cols-1 gap-1 px-5 py-4 transition-colors duration-200 hover:bg-zinc-50 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-6">
            <span className="font-medium text-zinc-900">{locale === "en" && e.name_en ? e.name_en : e.name_mn}</span>
            <span className="font-mono text-sm text-zinc-500">{e.event_date}</span>
            <span className="text-sm text-zinc-600">{t.photosCount.replace("{n}", String(e.photo_count))}</span>
            <span className={`text-sm ${statusTone[e.status]}`}>{t.status[e.status]}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
