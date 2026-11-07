"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { helpClass, inputClass, labelClass, primaryButton } from "@/components/ui/styles";
import { submitApplication } from "../actions";

type Defaults = { displayName: string; contactEmail: string; phone: string; bio: string; portfolio: string };

export function ApplyForm({ locale, t, pendingLabel, defaults }: { locale: Locale; t: Dictionary["photographer"]; pendingLabel: string; defaults: Defaults }) {
  const [state, action, pending] = useActionState(submitApplication, undefined);
  const v = state?.values ?? defaults;

  return (
    <form action={action} className="flex max-w-xl flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />

      <div className="flex flex-col gap-2">
        <label htmlFor="displayName" className={labelClass}>{t.displayName}</label>
        <input id="displayName" name="displayName" required minLength={2} maxLength={80} defaultValue={v.displayName} aria-describedby="displayName-help" className={inputClass} />
        <p id="displayName-help" className={helpClass}>{t.displayNameHelp}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="contactEmail" className={labelClass}>{t.contactEmail}</label>
          <input id="contactEmail" name="contactEmail" type="email" maxLength={254} defaultValue={v.contactEmail} className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className={labelClass}>{t.phone}</label>
          <input id="phone" name="phone" type="tel" maxLength={32} defaultValue={v.phone} className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="bio" className={labelClass}>{t.bio}</label>
        <textarea id="bio" name="bio" rows={4} maxLength={2000} defaultValue={v.bio} aria-describedby="bio-help" className={inputClass} />
        <p id="bio-help" className={helpClass}>{t.bioHelp}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="portfolio" className={labelClass}>{t.portfolio}</label>
        <textarea id="portfolio" name="portfolio" rows={3} required defaultValue={v.portfolio} placeholder="https://" aria-describedby="portfolio-help" className={`${inputClass} font-mono text-sm`} />
        <p id="portfolio-help" className={helpClass}>{t.portfolioHelp}</p>
      </div>

      <label className="flex items-start gap-3 text-sm leading-relaxed text-zinc-700">
        <input type="checkbox" name="consent" required className="mt-1 size-4 accent-zinc-900" />
        <span>{t.consent}</span>
      </label>

      {state?.error && <p role="alert" className="text-sm text-red-700">{t.errors[state.error]}</p>}

      <button type="submit" disabled={pending} className={`${primaryButton} w-fit`}>
        {pending ? pendingLabel : t.submit}
      </button>
    </form>
  );
}
