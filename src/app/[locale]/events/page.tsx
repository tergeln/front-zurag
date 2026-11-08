import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { listPublicEvents } from "@/lib/public/queries";
import { PageIntro } from "@/components/layout/page-intro";
import { EventCards } from "@/components/gallery/event-cards";

export default async function EventsPage({ params }: PageProps<"/[locale]/events">) {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).gallery;
  const events = await listPublicEvents();

  return (
    <PageIntro title={t.title} lead={t.lead}>
      {events.length ? (
        <EventCards locale={locale} t={t} events={events} />
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600">{t.empty}</p>
      )}
    </PageIntro>
  );
}
