import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatMnt } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { PageIntro } from "@/components/layout/page-intro";
import { primaryButton, textLink } from "@/components/ui/styles";
import { PaymentStatus } from "./payment-status";

type Order = { id: string; order_no: string; total_mnt: number; status: string; expires_at: string; order_items: { count: number }[] };
type Payment = { qr_text: string | null; urls: { name: string; description?: string; logo?: string; link: string }[]; status: string };

/** Checkout, success and failure in one page: what it shows comes only from the database. */
export default async function CheckoutPage({ params }: PageProps<"/[locale]/checkout/[orderId]">) {
  const { locale: rawLocale, orderId } = await params;
  const locale = resolveLocale(rawLocale);
  await requireUser(locale, `/${locale}/checkout/${orderId}`);
  if (!/^[0-9a-f-]{36}$/.test(orderId)) notFound();
  const t = getDictionary(locale).checkout;

  const supabase = await createClient();
  // RLS: only the customer's own order is visible.
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_no, total_mnt, status, expires_at, order_items(count)")
    .eq("id", orderId)
    .maybeSingle<Order>();
  if (!order) notFound();
  const { data: payment } = await supabase
    .from("payments")
    .select("qr_text, urls, status")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Payment>();

  const summary = (
    <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-[15px]">
      <dt className="text-zinc-500">{t.order}</dt>
      <dd className="font-mono text-zinc-900">{order.order_no}</dd>
      <dt className="text-zinc-500">{t.amount}</dt>
      <dd className="font-mono text-xl text-zinc-950">{formatMnt(Number(order.total_mnt))}₮</dd>
      <dt className="text-zinc-500" />
      <dd className="text-sm text-zinc-500">{t.items.replace("{n}", String(order.order_items?.[0]?.count ?? 0))}</dd>
    </dl>
  );

  if (order.status === "paid") {
    return (
      <PageIntro title={t.paidTitle}>
        <div className="flex max-w-xl flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <p className="leading-relaxed text-zinc-800">{t.paidBody}</p>
          {summary}
          <Link href={`/${locale}/downloads`} className={`${primaryButton} w-fit`}>{t.downloads}</Link>
        </div>
      </PageIntro>
    );
  }

  if (order.status !== "pending" || !payment?.qr_text) {
    const expired = order.status !== "cancelled";
    return (
      <PageIntro title={expired ? t.expiredTitle : t.cancelledTitle}>
        <p className="max-w-xl text-zinc-700">{expired ? t.expiredBody : t.cancelledBody}</p>
        <Link href={`/${locale}/cart`} className={`${primaryButton} w-fit`}>{t.backToCart}</Link>
      </PageIntro>
    );
  }

  const qrSvg = await QRCode.toString(payment.qr_text, { type: "svg", margin: 1, errorCorrectionLevel: "M" });

  return (
    <PageIntro title={t.title}>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-3">
          <div className="aspect-square w-full max-w-[320px] rounded-2xl border border-zinc-200 bg-white p-4" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <p className="text-sm text-zinc-600">{t.scan}</p>
        </div>
        <div className="flex flex-col gap-6">
          {summary}
          <p className="text-sm text-zinc-500">
            {t.expiresAt}: {formatDate(order.expires_at, locale, true)}
          </p>
          <PaymentStatus orderId={order.id} t={t} />
          {payment.urls.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-zinc-600">{t.orApp}</p>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {payment.urls.map((u) => (
                  <li key={u.link}>
                    <a href={u.link} className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-50">
                      {u.logo && (
                        // eslint-disable-next-line @next/next/no-img-element -- bank logos come from QPay's URLs
                        <img src={u.logo} alt="" className="size-6 rounded" />
                      )}
                      <span className="truncate">{u.description || u.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-[13px] text-zinc-500">{t.note}</p>
          <Link href={`/${locale}/cart`} className={`${textLink} w-fit text-sm`}>{t.backToCart}</Link>
        </div>
      </div>
    </PageIntro>
  );
}
