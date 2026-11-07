import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireApprovedPhotographer } from "@/lib/auth/photographer";
import { SALES_PAGE_SIZE, getMyBalance, getMySales } from "@/lib/earnings/queries";
import { formatMnt } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { PageIntro } from "@/components/layout/page-intro";
import { BalanceCards } from "@/components/earnings/balance-cards";
import { textLink } from "@/components/ui/styles";

export default async function SalesPage({ params, searchParams }: PageProps<"/[locale]/photographer/sales">) {
  const locale = resolveLocale((await params).locale);
  await requireApprovedPhotographer(locale, `/${locale}/photographer/sales`);
  const page = Math.max(0, Number((await searchParams).page) || 0);
  const t = getDictionary(locale).money;
  const [balance, sales] = await Promise.all([getMyBalance(), getMySales(page)]);
  const total = Number(sales[0]?.total ?? 0);
  const base = `/${locale}/photographer/sales`;

  return (
    <PageIntro title={t.salesTitle} lead={t.salesLead}>
      <BalanceCards balance={balance} t={t} />
      {sales.length ? (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t.photo}</th>
                <th className="px-4 py-3 font-medium">{t.date}</th>
                <th className="px-4 py-3 font-medium">{t.event}</th>
                <th className="px-4 py-3 text-right font-medium">{t.gross}</th>
                <th className="px-4 py-3 text-right font-medium">{t.fee}</th>
                <th className="px-4 py-3 text-right font-medium">{t.yours}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {sales.map((s) => (
                <tr key={s.id} className={s.type === "refund_adjustment" ? "bg-red-50/50" : ""}>
                  <td className="px-4 py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- signed, short-lived R2 URL via redirect */}
                    <img src={`/api/photos/${s.photo_id}/image?variant=thumb`} alt="" loading="lazy" className="size-10 rounded object-cover" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-zinc-600">
                    {formatDate(s.created_at, locale)}
                    {s.type === "refund_adjustment" && <span className="ml-2 text-red-700">{t.types.refund_adjustment}</span>}
                  </td>
                  <td className="max-w-[16rem] truncate px-4 py-2 text-zinc-800">{s.event_name_mn}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatMnt(Number(s.gross_mnt))}</td>
                  <td className="px-4 py-2 text-right font-mono text-zinc-500">{formatMnt(Number(s.platform_fee_mnt))}</td>
                  <td className="px-4 py-2 text-right font-mono text-zinc-950">{formatMnt(Number(s.photographer_mnt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600">{t.noSales}</p>
      )}
      <div className="flex gap-4 text-sm">
        {page > 0 && <Link href={`${base}?page=${page - 1}`} className={textLink}>←</Link>}
        {(page + 1) * SALES_PAGE_SIZE < total && <Link href={`${base}?page=${page + 1}`} className={textLink}>→</Link>}
      </div>
    </PageIntro>
  );
}
