"use client";

import { useActionState, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { inputClass, labelClass, primaryButton, secondaryButton } from "@/components/ui/styles";
import { createInvitation } from "../actions";

export function InviteForm({ locale, t, errors }: { locale: Locale; t: Dictionary["admin"]["photographers"]; errors: Dictionary["admin"]["errors"] }) {
  const [state, action, pending] = useActionState(createInvitation, undefined);
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
        <input type="hidden" name="locale" value={locale} />
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="invite-email" className={labelClass}>{t.inviteEmail}</label>
          <input id="invite-email" name="email" type="email" required maxLength={254} className={inputClass} />
        </div>
        <button type="submit" disabled={pending} className={primaryButton}>{t.inviteSubmit}</button>
      </form>

      {state?.error && <p role="alert" className="text-sm text-red-700">{errors[state.error]}</p>}

      {state?.link && (
        <div className="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-zinc-700">{t.inviteLink}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input readOnly value={state.link} onFocus={(e) => e.currentTarget.select()} className={`${inputClass} font-mono text-[13px]`} />
            <button
              type="button"
              className={secondaryButton}
              onClick={async () => {
                await navigator.clipboard.writeText(state.link!);
                setCopied(true);
              }}
            >
              {copied ? t.copied : t.copy}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
