import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireApprovedPhotographer } from "@/lib/auth/photographer";
import { listEvents } from "@/lib/events/queries";
import { PageIntro } from "@/components/layout/page-intro";
import { EventList } from "@/components/events/event-list";
import { EventForm } from "@/components/events/event-form";

export default async function StudioEventsPage({ params }: PageProps<"/[locale]/photographer/events">) {
  const locale = resolveLocale((await params).locale);
  await requireApprovedPhotographer(locale, `/${locale}/photographer/events`);
  const t = getDictionary(locale).events;
  const events = await listEvents(); // RLS: only events this photographer belongs to

  return (
    <PageIntro title={t.title} lead={t.lead}>
      <EventList events={events} locale={locale} t={t} base={`/${locale}/photographer/events`} />
      <details className="max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 [&_summary]:cursor-pointer" open={events.length === 0}>
        <summary className="font-medium text-zinc-900">{t.create}</summary>
        <div className="pt-5">
          <EventForm locale={locale} t={t} base="photographer" />
        </div>
      </details>
    </PageIntro>
  );
}
