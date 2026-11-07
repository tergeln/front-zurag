import type { Dictionary } from "@/i18n/dictionaries/mn";
import type { Balance } from "@/lib/earnings/queries";
import { formatMnt } from "@/lib/money";

export function BalanceCards({ balance, t }: { balance: Balance; t: Dictionary["money"] }) {
  const cards = [
    { label: t.available, value: balance.available_mnt, strong: true },
    { label: t.earned, value: balance.earned_mnt },
    { label: t.pending, value: balance.pending_payout_mnt },
    { label: t.paidOut, value: balance.paid_out_mnt },
  ];
  return (
    <div className="grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 md:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="flex flex-col gap-1 bg-white p-5">
          <span className={`font-mono ${c.strong ? "text-2xl text-zinc-950" : "text-xl text-zinc-800"}`}>{formatMnt(c.value)}₮</span>
          <span className="text-sm text-zinc-600">{c.label}</span>
        </div>
      ))}
    </div>
  );
}
