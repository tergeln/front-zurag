import { revalidatePath } from "next/cache";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { isLocale } from "@/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageIntro } from "@/components/layout/page-intro";
import { secondaryButton } from "@/components/ui/styles";
import { formatDate } from "@/lib/format";

type Notification = { id: number; type: string; payload: { note?: string | null }; read_at: string | null; created_at: string };

async function markAllRead(formData: FormData) {
  "use server";
  const locale = String(formData.get("locale"));
  const supabase = await createClient();
  await supabase.rpc("mark_notifications_read");
  revalidatePath(`/${isLocale(locale) ? locale : "mn"}`, "layout");
}

export default async function NotificationsPage({ params }: PageProps<"/[locale]/notifications">) {
  const locale = resolveLocale((await params).locale);
  await requireUser(locale, `/${locale}/notifications`);
  const t = getDictionary(locale).notifications;

  const supabase = await createClient();
  // RLS returns only the signed-in user's own notifications.
  const { data } = await supabase
    .from("notifications")
    .select("id, type, payload, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<Notification[]>();
  const hasUnread = data?.some((n) => !n.read_at);

  return (
    <PageIntro title={t.title}>
      {hasUnread && (
        <form action={markAllRead}>
          <input type="hidden" name="locale" value={locale} />
          <button type="submit" className={`${secondaryButton} py-1.5 text-sm`}>{t.markAllRead}</button>
        </form>
      )}
      {data?.length ? (
        <ul className="flex max-w-2xl flex-col divide-y divide-zinc-200 border-y border-zinc-200">
          {data.map((n) => {
            const copy = t.types[n.type] ?? { title: n.type, body: "" };
            return (
              <li key={n.id} className="flex gap-4 py-4">
                <span aria-hidden className={`mt-2 size-2 shrink-0 rounded-full ${n.read_at ? "bg-transparent" : "bg-[var(--color-accent)]"}`} />
                <div className="flex flex-col gap-1">
                  <p className={`text-zinc-950 ${n.read_at ? "" : "font-medium"}`}>{copy.title}</p>
                  {copy.body && <p className="text-sm leading-relaxed text-zinc-600">{copy.body}</p>}
                  {n.payload?.note && (
                    <p className="text-sm text-zinc-700">
                      <span className="font-medium">{t.note}:</span> {n.payload.note}
                    </p>
                  )}
                  <p className="text-[13px] text-zinc-400">{formatDate(n.created_at, locale, true)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="max-w-2xl rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600">{t.empty}</p>
      )}
    </PageIntro>
  );
}
