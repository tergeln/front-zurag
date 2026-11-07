import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageIntro } from "@/components/layout/page-intro";
import { formatDate } from "@/lib/format";

type AuditRow = { id: number; action: string; entity_type: string; created_at: string; actor: { full_name: string | null } | null };

export default async function AdminPage({ params }: PageProps<"/[locale]/admin">) {
  const locale = resolveLocale((await params).locale);
  await requireRole(locale, `/${locale}/admin`, "admin");
  const dict = getDictionary(locale);
  const t = dict.admin.overview;

  const supabase = await createClient();
  const [users, pending, active, audit] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("photographer_applications").select("id", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("photographer_profiles").select("user_id", { count: "exact", head: true }).eq("status", "approved"),
    supabase
      .from("audit_logs")
      .select("id, action, entity_type, created_at, actor:users(full_name)")
      .order("created_at", { ascending: false })
      .limit(15)
      .returns<AuditRow[]>(),
  ]);

  const stats = [
    { label: t.users, value: users.count ?? 0, href: `/${locale}/admin/users` },
    { label: t.pendingApplications, value: pending.count ?? 0, href: `/${locale}/admin/applications` },
    { label: t.activePhotographers, value: active.count ?? 0, href: `/${locale}/admin/photographers` },
  ];

  return (
    <PageIntro title={dict.dashboard.adminTitle} lead={dict.dashboard.adminLead}>
      <div className="grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="flex flex-col gap-1 bg-white p-6 transition-colors duration-200 hover:bg-zinc-50">
            <span className="font-mono text-3xl text-zinc-950">{s.value}</span>
            <span className="text-sm text-zinc-600">{s.label}</span>
          </Link>
        ))}
      </div>

      <section className="flex max-w-3xl flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-950">{t.recentActivity}</h2>
        {audit.data?.length ? (
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200 text-sm">
            {audit.data.map((row) => (
              <li key={row.id} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[1fr_auto] sm:gap-4">
                <span className="font-mono text-[13px] text-zinc-800">{row.action}</span>
                <span className="text-zinc-500">
                  {row.actor?.full_name ?? "—"} · {formatDate(row.created_at, locale, true)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">{t.noActivity}</p>
        )}
      </section>
    </PageIntro>
  );
}
