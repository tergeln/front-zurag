import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageIntro } from "@/components/layout/page-intro";
import { textLink } from "@/components/ui/styles";
import { formatDate } from "@/lib/format";

type AuditRow = {
  id: number;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor: { full_name: string | null } | null;
};

const PAGE_SIZE = 50;

export default async function AuditPage({ params, searchParams }: PageProps<"/[locale]/admin/audit">) {
  const locale = resolveLocale((await params).locale);
  await requireRole(locale, `/${locale}/admin/audit`, "admin");
  const page = Math.max(0, Number((await searchParams).page) || 0);
  const t = getDictionary(locale).admin.audit;

  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, metadata, created_at, actor:users(full_name)")
    .order("id", { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE) // one extra row tells us if there is a next page
    .returns<AuditRow[]>();
  const rows = (data ?? []).slice(0, PAGE_SIZE);
  const hasNext = (data?.length ?? 0) > PAGE_SIZE;
  const base = `/${locale}/admin/audit`;

  return (
    <PageIntro title={t.title} lead={t.lead}>
      {rows.length ? (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-medium">{t.time}</th>
                <th className="px-5 py-3 font-medium">{t.actor}</th>
                <th className="px-5 py-3 font-medium">{t.action}</th>
                <th className="px-5 py-3 font-medium">{t.details}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 align-top">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap px-5 py-3 text-zinc-500">{formatDate(r.created_at, locale, true)}</td>
                  <td className="px-5 py-3 text-zinc-800">{r.actor?.full_name ?? "—"}</td>
                  <td className="px-5 py-3 font-mono text-[13px] text-zinc-900">{r.action}</td>
                  <td className="max-w-sm break-all px-5 py-3 font-mono text-[12px] text-zinc-500">
                    {Object.keys(r.metadata ?? {}).length ? JSON.stringify(r.metadata) : r.entity_id ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600">{t.empty}</p>
      )}
      <div className="flex gap-4 text-sm">
        {page > 0 && <Link href={`${base}?page=${page - 1}`} className={textLink}>{t.prev}</Link>}
        {hasNext && <Link href={`${base}?page=${page + 1}`} className={textLink}>{t.next}</Link>}
      </div>
    </PageIntro>
  );
}
