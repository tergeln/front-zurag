import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireApprovedPhotographer } from "@/lib/auth/photographer";
import { getMyBalance, listPayouts } from "@/lib/earnings/queries";
import { formatMnt } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { PageIntro } from "@/components/layout/page-intro";
import { BalanceCards } from "@/components/earnings/balance-cards";
import { PayoutForm } from "./payout-form";

const tone = { requested: "text-amber-700", approved: "text-sky-700", paid: "text-emerald-700", rejected: "text-zinc-500" } as const;

export default async function PayoutsPage({ params }: PageProps<"/[locale]/photographer/payouts">) {
  const locale = resolveLocale((await params).locale);
  await requireApprovedPhotographer(locale, `/${locale}/photographer/payouts`);
  const t = getDictionary(locale).money;
  const [balance, payouts] = await Promise.all([getMyBalance(), listPayouts(50)]);
  const hasOpen = payouts.some((p) => p.status === "requested" || p.status === "approved");

  return (
    <PageIntro title={t.payoutsTitle} lead={t.payoutsLead}>
      <BalanceCards balance={balance} t={t} />
      {!hasOpen && <PayoutForm locale={locale} t={t} available={balance.available_mnt} />}

      <section className="flex max-w-3xl flex-col gap-3">
        <h2 className="text-lg font-semibold text-zinc-950">{t.history}</h2>
        {payouts.length ? (
          <ul className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white text-sm">
            {payouts.map((p) => (
              <li key={p.id} className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6">
                <span className="font-mono text-zinc-950">{formatMnt(Number(p.amount_mnt))}₮</span>
                <span className="text-zinc-600">
                  {formatDate(p.requested_at, locale)} · {p.bank_name} ••{p.account_number.slice(-4)}
                  {p.reference && <> · {t.reference}: {p.reference}</>}
                  {p.note && <> · {p.note}</>}
                </span>
                <span className={tone[p.status]}>{t.statuses[p.status]}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">{t.noPayouts}</p>
        )}
      </section>
    </PageIntro>
  );
}
