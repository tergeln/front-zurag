import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageIntro } from "@/components/layout/page-intro";
import { inputClass, primaryButton, secondaryButton } from "@/components/ui/styles";
import { formatDate } from "@/lib/format";
import { reviewApplication } from "../actions";

type Row = {
  id: string;
  display_name: string;
  bio: string | null;
  contact_email: string | null;
  phone: string | null;
  portfolio_urls: string[];
  status: "submitted" | "approved" | "rejected";
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

const ERROR_KEYS = ["forbidden", "notOpen", "invalidEmail", "generic"] as const;

export default async function ApplicationsPage({ params, searchParams }: PageProps<"/[locale]/admin/applications">) {
  const locale = resolveLocale((await params).locale);
  await requireRole(locale, `/${locale}/admin/applications`, "admin");
  const { error } = await searchParams;
  const dict = getDictionary(locale);
  const t = dict.admin.applications;

  const supabase = await createClient();
  const columns = "id, display_name, bio, contact_email, phone, portfolio_urls, status, review_note, created_at, reviewed_at";
  const [open, decided] = await Promise.all([
    supabase.from("photographer_applications").select(columns).eq("status", "submitted").order("created_at").returns<Row[]>(),
    supabase.from("photographer_applications").select(columns).neq("status", "submitted").order("reviewed_at", { ascending: false }).limit(20).returns<Row[]>(),
  ]);
  const errorKey = ERROR_KEYS.find((k) => k === error);

  return (
    <PageIntro title={t.title} lead={t.lead}>
      {errorKey && <p role="alert" className="text-sm text-red-700">{dict.admin.errors[errorKey]}</p>}

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-zinc-500">{t.open} · {open.data?.length ?? 0}</h2>
        {open.data?.length ? (
          <ul className="flex flex-col gap-4">
            {open.data.map((app) => (
              <li key={app.id} className="grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-white p-6 lg:grid-cols-[1fr_320px]">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-lg font-semibold text-zinc-950">{app.display_name}</h3>
                    <span className="text-sm text-zinc-500">{formatDate(app.created_at, locale, true)}</span>
                  </div>
                  {app.bio && <p className="max-w-[65ch] whitespace-pre-line leading-relaxed text-zinc-700">{app.bio}</p>}
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                    <dt className="text-zinc-500">{t.contact}</dt>
                    <dd className="text-zinc-800">{[app.contact_email, app.phone].filter(Boolean).join(" · ") || "—"}</dd>
                    <dt className="text-zinc-500">{t.portfolio}</dt>
                    <dd className="flex flex-col gap-1">
                      {app.portfolio_urls.map((url) => (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-zinc-800 underline underline-offset-4 hover:text-[var(--color-accent)]">
                          {url}
                        </a>
                      ))}
                    </dd>
                  </dl>
                </div>

                <form action={reviewApplication} className="flex flex-col gap-3">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="applicationId" value={app.id} />
                  <label htmlFor={`note-${app.id}`} className="text-sm font-medium text-zinc-800">{t.note}</label>
                  <textarea id={`note-${app.id}`} name="note" rows={3} maxLength={1000} placeholder={t.notePlaceholder} className={inputClass} />
                  <div className="flex gap-2">
                    <button type="submit" name="decision" value="approve" className={primaryButton}>{t.approve}</button>
                    <button type="submit" name="decision" value="reject" className={secondaryButton}>{t.reject}</button>
                  </div>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600">{t.empty}</p>
        )}
      </section>

      {!!decided.data?.length && (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-zinc-500">{t.closed}</h2>
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200 text-sm">
            {decided.data.map((app) => (
              <li key={app.id} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[1fr_auto_auto] sm:gap-6">
                <span className="text-zinc-900">{app.display_name}</span>
                <span className={app.status === "approved" ? "text-emerald-700" : "text-zinc-500"}>{t.statuses[app.status]}</span>
                <span className="text-zinc-500">{app.reviewed_at ? formatDate(app.reviewed_at, locale) : ""}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageIntro>
  );
}
