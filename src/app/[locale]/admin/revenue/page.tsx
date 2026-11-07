import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatMnt } from "@/lib/money";
import { todayInUlaanbaatar } from "@/lib/format";
import { PageIntro } from "@/components/layout/page-intro";
import { inputClass, secondaryButton } from "@/components/ui/styles";

type Summary = {
  orders_paid: number;
  gross_mnt: number;
  refunds_mnt: number;
  net_mnt: number;
  platform_mnt: number;
  company_photo_mnt: number;
  commission_mnt: number;
  photographers_mnt: number;
};
type BalanceRow = { photographer_id: string; display_name: string; earned_mnt: number; paid_out_mnt: number; pending_payout_mnt: number; available_mnt: number };

const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

export default async function RevenuePage({ params, searchParams }: PageProps<"/[locale]/admin/revenue">) {
  const locale = resolveLocale((await params).locale);
  await requireRole(locale, `/${locale}/admin/revenue`, "admin");
  const sp = await searchParams;
  const dict = getDictionary(locale);
  const t = dict.admin.revenue;

  // Default: this month, in Ulaanbaatar time.
  const today = todayInUlaanbaatar();
  const from = isDate(sp.from) ? sp.from : `${today.slice(0, 8)}01`;
  const to = isDate(sp.to) ? sp.to : today;

  const supabase = await createClient();
  const [{ data: summaryRows }, { data: balances }] = await Promise.all([
    supabase.rpc("admin_revenue_summary", { p_from: from, p_to: to }),
    supabase.rpc("admin_photographer_balances"),
  ]);
  const s = ((summaryRows ?? []) as Summary[])[0];
  const money = (n: number | undefined) => `${formatMnt(Number(n ?? 0))}₮`;
  const cards = [
    { label: t.ordersPaid, value: String(s?.orders_paid ?? 0) },
    { label: t.gross, value: money(s?.gross_mnt) },
    { label: t.refunds, value: money(s?.refunds_mnt) },
    { label: t.net, value: money(s?.net_mnt) },
    { label: t.platform, value: money(s?.platform_mnt), strong: true },
    { label: t.companyPhotos, value: money(s?.company_photo_mnt) },
    { label: t.commission, value: money(s?.commission_mnt) },
    { label: t.photographers, value: money(s?.photographers_mnt) },
  ];

  return (
    <PageIntro title={t.title} lead={t.lead}>
      <form className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-zinc-600">
          {t.from}
          <input type="date" name="from" defaultValue={from} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-600">
          {t.to}
          <input type="date" name="to" defaultValue={to} className={inputClass} />
        </label>
        <button type="submit" className={secondaryButton}>{t.show}</button>
      </form>

      <div className="grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="flex flex-col gap-1 bg-white p-5">
            <span className={`font-mono ${c.strong ? "text-2xl text-zinc-950" : "text-xl text-zinc-800"}`}>{c.value}</span>
            <span className="text-sm text-zinc-600">{c.label}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-zinc-500">{t.note}</p>

      <section className="flex max-w-5xl flex-col gap-3">
        <h2 className="text-lg font-semibold text-zinc-950">{t.balances}</h2>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">{dict.admin.payouts.photographer}</th>
                <th className="px-4 py-3 text-right font-medium">{dict.money.earned}</th>
                <th className="px-4 py-3 text-right font-medium">{dict.money.paidOut}</th>
                <th className="px-4 py-3 text-right font-medium">{dict.money.pending}</th>
                <th className="px-4 py-3 text-right font-medium">{dict.money.available}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {((balances ?? []) as BalanceRow[]).map((b) => (
                <tr key={b.photographer_id}>
                  <td className="px-4 py-2.5 text-zinc-900">{b.display_name}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatMnt(Number(b.earned_mnt))}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatMnt(Number(b.paid_out_mnt))}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatMnt(Number(b.pending_payout_mnt))}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-zinc-950">{formatMnt(Number(b.available_mnt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageIntro>
  );
}
