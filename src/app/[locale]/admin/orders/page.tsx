import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatMnt } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { PageIntro } from "@/components/layout/page-intro";

type OrderRow = {
  id: string;
  order_no: string;
  total_mnt: number;
  status: "pending" | "paid" | "cancelled" | "expired" | "refunded" | "partially_refunded";
  paid_at: string | null;
  created_at: string;
  order_items: { count: number }[];
};

const tone: Record<OrderRow["status"], string> = {
  pending: "text-amber-700",
  paid: "text-emerald-700",
  cancelled: "text-zinc-400",
  expired: "text-zinc-400",
  refunded: "text-red-700",
  partially_refunded: "text-red-700",
};

export default async function OrdersPage({ params }: PageProps<"/[locale]/admin/orders">) {
  const locale = resolveLocale((await params).locale);
  await requireRole(locale, `/${locale}/admin/orders`, "admin");
  const t = getDictionary(locale).admin.orders;
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, order_no, total_mnt, status, paid_at, created_at, order_items(count)")
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<OrderRow[]>();

  return (
    <PageIntro title={t.title}>
      {data?.length ? (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t.orderNo}</th>
                <th className="px-4 py-3 font-medium">{t.status}</th>
                <th className="px-4 py-3 text-right font-medium">{t.items}</th>
                <th className="px-4 py-3 text-right font-medium">{t.total}</th>
                <th className="px-4 py-3 font-medium">{t.paidAt}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/${locale}/admin/orders/${o.id}`} className="font-mono text-zinc-900 underline-offset-4 hover:underline">{o.order_no}</Link>
                  </td>
                  <td className={`px-4 py-2.5 ${tone[o.status]}`}>{t.statuses[o.status]}</td>
                  <td className="px-4 py-2.5 text-right">{o.order_items?.[0]?.count ?? 0}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatMnt(Number(o.total_mnt))}₮</td>
                  <td className="px-4 py-2.5 text-zinc-500">{o.paid_at ? formatDate(o.paid_at, locale, true) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600">{t.empty}</p>
      )}
    </PageIntro>
  );
}
