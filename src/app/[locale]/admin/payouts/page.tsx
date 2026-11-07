import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { decidePayout, markPayoutPaid } from "@/lib/earnings/actions";
import type { Payout } from "@/lib/earnings/queries";
import { formatMnt } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { PageIntro } from "@/components/layout/page-intro";
import { inputClass, primaryButton, secondaryButton } from "@/components/ui/styles";

type Row = Payout & { photographer: { display_name: string } | null };
const ERRORS = ["not_open", "not_approved", "reference_required", "generic"] as const;
const tone = { requested: "text-amber-700", approved: "text-sky-700", paid: "text-emerald-700", rejected: "text-zinc-500" } as const;

export default async function AdminPayoutsPage({ params, searchParams }: PageProps<"/[locale]/admin/payouts">) {
  const locale = resolveLocale((await params).locale);
  await requireRole(locale, `/${locale}/admin/payouts`, "admin");
  const { error } = await searchParams;
  const dict = getDictionary(locale);
  const t = dict.admin.payouts;
  const m = dict.money;

  const supabase = await createClient();
  const { data } = await supabase
    .from("payouts")
    .select("*, photographer:photographer_profiles!inner(display_name)")
    .order("requested_at", { ascending: false })
    .limit(200)
    .returns<Row[]>();
  const rows = (data ?? []).sort((a, b) => Number(b.status === "requested" || b.status === "approved") - Number(a.status === "requested" || a.status === "approved"));
  const errorKey = ERRORS.find((k) => k === error);

  return (
    <PageIntro title={t.title} lead={t.lead}>
      {errorKey && <p role="alert" className="text-sm text-red-700">{t.errors[errorKey]}</p>}
      {rows.length ? (
        <ul className="flex max-w-4xl flex-col gap-3">
          {rows.map((p) => (
            <li key={p.id} className="grid grid-cols-1 gap-4 rounded-2xl border border-zinc-200 bg-white p-5 md:grid-cols-[1fr_320px]">
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-mono text-lg text-zinc-950">{formatMnt(Number(p.amount_mnt))}₮</span>
                  <span className={tone[p.status]}>{m.statuses[p.status]}</span>
                </div>
                <span className="text-zinc-900">{p.photographer?.display_name}</span>
                <span className="text-zinc-600">
                  {t.bank}: {p.bank_name} · <span className="font-mono">{p.account_number}</span> · {p.account_holder}
                </span>
                <span className="text-zinc-500">{formatDate(p.requested_at, locale, true)}</span>
                {p.reference && <span className="text-zinc-600">{m.reference}: {p.reference}</span>}
                {p.note && <span className="text-zinc-600">{p.note}</span>}
              </div>

              {p.status === "requested" && (
                <form action={decidePayout} className="flex flex-col gap-2">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="payoutId" value={p.id} />
                  <input name="note" maxLength={500} placeholder={t.notePlaceholder} className={inputClass} />
                  <div className="flex gap-2">
                    <button type="submit" name="decision" value="approve" className={primaryButton}>{t.approve}</button>
                    <button type="submit" name="decision" value="reject" className={secondaryButton}>{t.reject}</button>
                  </div>
                </form>
              )}
              {p.status === "approved" && (
                <form action={markPayoutPaid} className="flex flex-col gap-2">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="payoutId" value={p.id} />
                  <input name="reference" required minLength={3} maxLength={120} placeholder={t.referencePlaceholder} className={inputClass} />
                  <button type="submit" className={`${primaryButton} w-fit`}>{t.markPaid}</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600">{t.empty}</p>
      )}
    </PageIntro>
  );
}
