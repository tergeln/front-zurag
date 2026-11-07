import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { refundItems } from "@/lib/earnings/actions";
import { formatMnt } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { PageIntro } from "@/components/layout/page-intro";
import { inputClass, secondaryButton, textLink } from "@/components/ui/styles";

type Item = {
  id: string;
  photo_id: string;
  owner_type: "platform" | "photographer";
  price_mnt: number;
  platform_fee_mnt: number;
  owner_earning_mnt: number;
  owner: { full_name: string | null } | null;
};
type Order = { id: string; order_no: string; total_mnt: number; status: keyof Dictionary["admin"]["orders"]["statuses"]; paid_at: string | null; order_items: Item[] };
type Dictionary = ReturnType<typeof getDictionary>;

const ERRORS = ["not_refundable", "nothing_to_refund", "generic"] as const;

export default async function AdminOrderPage({ params, searchParams }: PageProps<"/[locale]/admin/orders/[id]">) {
  const { locale: rawLocale, id } = await params;
  const locale = resolveLocale(rawLocale);
  await requireRole(locale, `/${locale}/admin/orders/${id}`, "admin");
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { error } = await searchParams;
  const dict = getDictionary(locale);
  const t = dict.admin.orders;

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_no, total_mnt, status, paid_at, order_items(id, photo_id, owner_type, price_mnt, platform_fee_mnt, owner_earning_mnt, owner:users!order_items_owner_id_fkey(full_name))")
    .eq("id", id)
    .maybeSingle<Order>();
  if (!order) notFound();
  const { data: refunds } = await supabase.from("refunds").select("order_item_id").eq("order_id", id);
  const refunded = new Set((refunds ?? []).map((r: { order_item_id: string }) => r.order_item_id));
  const canRefund = order.status === "paid" || order.status === "partially_refunded";
  const back = `/${locale}/admin/orders/${id}`;
  const errorKey = ERRORS.find((k) => k === error);

  return (
    <PageIntro title={order.order_no} lead={`${t.statuses[order.status]} · ${formatMnt(Number(order.total_mnt))}₮${order.paid_at ? ` · ${formatDate(order.paid_at, locale, true)}` : ""}`}>
      <Link href={`/${locale}/admin/orders`} className={`${textLink} w-fit text-sm`}>← {t.back}</Link>
      {errorKey && <p role="alert" className="text-sm text-red-700">{t.errors[errorKey]}</p>}

      <form action={refundItems} className="flex flex-col gap-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="orderId" value={order.id} />
        <input type="hidden" name="back" value={back} />
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="w-10 px-4 py-3" />
                <th className="px-4 py-3 font-medium">{dict.money.photo}</th>
                <th className="px-4 py-3 font-medium">{t.owner}</th>
                <th className="px-4 py-3 text-right font-medium">{t.price}</th>
                <th className="px-4 py-3 text-right font-medium">{t.fee}</th>
                <th className="px-4 py-3 text-right font-medium">{t.earning}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {order.order_items.map((i) => (
                <tr key={i.id} className={refunded.has(i.id) ? "opacity-50" : ""}>
                  <td className="px-4 py-2">
                    {canRefund && !refunded.has(i.id) ? (
                      <input type="checkbox" name="itemIds" value={i.id} aria-label={t.refund} className="size-4 accent-zinc-900" />
                    ) : refunded.has(i.id) ? (
                      <span className="text-[12px] text-red-700">{t.refunded}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- signed, short-lived R2 URL via redirect */}
                    <img src={`/api/photos/${i.photo_id}/image?variant=thumb`} alt="" loading="lazy" className="size-10 rounded object-cover" />
                  </td>
                  <td className="px-4 py-2 text-zinc-700">{i.owner_type === "platform" ? dict.gallery.company : (i.owner?.full_name ?? "—")}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatMnt(Number(i.price_mnt))}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatMnt(Number(i.platform_fee_mnt))}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatMnt(Number(i.owner_earning_mnt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {canRefund && (
          <div className="flex max-w-2xl flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-zinc-950">{t.refundTitle}</h2>
            <p className="text-sm leading-relaxed text-zinc-600">{t.refundLead}</p>
            <label htmlFor="reason" className="text-sm font-medium text-zinc-800">{t.reason}</label>
            <input id="reason" name="reason" maxLength={500} className={inputClass} />
            <button type="submit" className={`${secondaryButton} w-fit text-red-700`}>{t.refund}</button>
          </div>
        )}
      </form>
    </PageIntro>
  );
}
