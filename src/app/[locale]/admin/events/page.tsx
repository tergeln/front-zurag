import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireRole } from "@/lib/auth/session";
import { listEvents } from "@/lib/events/queries";
import { PageIntro } from "@/components/layout/page-intro";
import { EventList } from "@/components/events/event-list";
import { EventForm } from "@/components/events/event-form";
import { primaryButton } from "@/components/ui/styles";

export default async function AdminEventsPage({ params, searchParams }: PageProps<"/[locale]/admin/events">) {
  const locale = resolveLocale((await params).locale);
  const openNew = (await searchParams).new === "1";
  await requireRole(locale, `/${locale}/admin/events`, "admin");
  const t = getDictionary(locale).events;
  const events = await listEvents();

  return (
    <PageIntro title={t.title}>
      <a href="?new=1#new-event" className={`${primaryButton} w-fit`}>+ {t.create}</a>
      <EventList events={events} locale={locale} t={t} base={`/${locale}/admin/events`} />
      <details id="new-event" className="max-w-2xl scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 [&_summary]:cursor-pointer" open={openNew}>
        <summary className="font-medium text-zinc-900">{t.create}</summary>
        <div className="pt-5">
          <EventForm locale={locale} t={t} base="admin" />
        </div>
      </details>
    </PageIntro>
  );
}
