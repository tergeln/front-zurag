"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { helpClass, inputClass, labelClass, primaryButton } from "@/components/ui/styles";
import { updateProfile } from "../../actions";

type Defaults = { displayName: string; contactEmail: string; phone: string; bio: string; portfolio: string };

export function ProfileForm({ locale, t, studio, defaults }: { locale: Locale; t: Dictionary["photographer"]; studio: Dictionary["studio"]; defaults: Defaults }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const v = state?.values ?? defaults;

  return (
    <form action={action} className="flex max-w-xl flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />

      <div className="flex flex-col gap-2">
        <label htmlFor="displayName" className={labelClass}>{t.displayName}</label>
        <input id="displayName" name="displayName" required minLength={2} maxLength={80} defaultValue={v.displayName} className={inputClass} />
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
        <textarea id="bio" name="bio" rows={5} maxLength={2000} defaultValue={v.bio} className={inputClass} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="portfolio" className={labelClass}>{t.portfolio}</label>
        <textarea id="portfolio" name="portfolio" rows={3} defaultValue={v.portfolio} placeholder="https://" aria-describedby="portfolio-help" className={`${inputClass} font-mono text-sm`} />
        <p id="portfolio-help" className={helpClass}>{t.portfolioHelp}</p>
      </div>

      {state?.error && <p role="alert" className="text-sm text-red-700">{t.errors[state.error]}</p>}
      {state?.saved && <p role="status" className="text-sm text-emerald-700">{studio.saved}</p>}

      <button type="submit" disabled={pending} className={`${primaryButton} w-fit`}>{studio.save}</button>
    </form>
  );
}
