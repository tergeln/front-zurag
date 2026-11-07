"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { helpClass, inputClass, labelClass, primaryButton } from "@/components/ui/styles";
import { updateSettings } from "../actions";

type Props = {
  locale: Locale;
  t: Dictionary["admin"]["settings"];
  errors: Dictionary["admin"]["errors"];
  commission: string;
  retention: number;
};

export function SettingsForm({ locale, t, errors, commission, retention }: Props) {
  const [state, action, pending] = useActionState(updateSettings, undefined);
  const errorText =
    state?.error === "invalidCommission" || state?.error === "invalidRetention" ? t.errors[state.error] : state?.error ? errors[state.error] : null;

  return (
    <form action={action} className="flex max-w-xl flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />

      <div className="flex flex-col gap-2">
        <label htmlFor="commission" className={labelClass}>{t.commission}</label>
        <input id="commission" name="commission" inputMode="decimal" required defaultValue={commission} aria-describedby="commission-help" className={`${inputClass} max-w-40 font-mono`} />
        <p id="commission-help" className={helpClass}>{t.commissionHelp}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="retention" className={labelClass}>{t.retention}</label>
        <input id="retention" name="retention" type="number" min={7} max={3650} required defaultValue={retention} aria-describedby="retention-help" className={`${inputClass} max-w-40 font-mono`} />
        <p id="retention-help" className={helpClass}>{t.retentionHelp}</p>
      </div>

      {errorText && <p role="alert" className="text-sm text-red-700">{errorText}</p>}
      {state?.saved && <p role="status" className="text-sm text-emerald-700">{t.saved}</p>}

      <button type="submit" disabled={pending} className={`${primaryButton} w-fit`}>{t.save}</button>
    </form>
  );
}
