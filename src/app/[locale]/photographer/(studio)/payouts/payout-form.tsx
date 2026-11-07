"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { helpClass, inputClass, labelClass, primaryButton } from "@/components/ui/styles";
import { requestPayout } from "@/lib/earnings/actions";

export function PayoutForm({ locale, t, available }: { locale: Locale; t: Dictionary["money"]; available: number }) {
  const [state, action, pending] = useActionState(requestPayout, undefined);
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6">
      <input type="hidden" name="locale" value={locale} />
      <div className="flex flex-col gap-2">
        <label htmlFor="amount" className={labelClass}>{t.amount}</label>
        <input id="amount" name="amount" inputMode="numeric" required defaultValue={available >= 10000 ? available : ""} className={`${inputClass} max-w-48 font-mono`} />
        <p className={helpClass}>{t.minimum}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="bankName" className={labelClass}>{t.bankName}</label>
          <input id="bankName" name="bankName" required maxLength={80} className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="accountNumber" className={labelClass}>{t.accountNumber}</label>
          <input id="accountNumber" name="accountNumber" required inputMode="numeric" maxLength={24} className={`${inputClass} font-mono`} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="accountHolder" className={labelClass}>{t.accountHolder}</label>
        <input id="accountHolder" name="accountHolder" required maxLength={120} className={inputClass} />
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-700">{t.errors[state.error]}</p>}
      {state?.ok && <p role="status" className="text-sm text-emerald-700">{t.requestedOk}</p>}
      <button type="submit" disabled={pending || available < 10000} className={`${primaryButton} w-fit disabled:cursor-not-allowed disabled:opacity-50`}>{t.request}</button>
    </form>
  );
}
