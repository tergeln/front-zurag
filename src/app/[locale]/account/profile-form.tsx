"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { updateMyProfile } from "@/lib/account/actions";
import { inputClass, labelClass, primaryButton } from "@/components/ui/styles";

type Props = {
  locale: Locale;
  t: Dictionary["account"];
  fullName: string | null;
  phone: string | null;
  language: Locale;
};

export function ProfileForm({ locale, t, fullName, phone, language }: Props) {
  const [state, action, pending] = useActionState(updateMyProfile, undefined);

  return (
    <form action={action} className="flex max-w-md flex-col gap-4 border-t border-zinc-200 pt-6">
      <input type="hidden" name="locale" value={locale} />
      <h2 className="text-lg font-semibold text-zinc-950">{t.profileTitle}</h2>
      <div className="flex flex-col gap-2">
        <label htmlFor="fullName" className={labelClass}>{t.fullName}</label>
        <input id="fullName" name="fullName" autoComplete="name" maxLength={120} defaultValue={fullName ?? ""} className={inputClass} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className={labelClass}>{t.phone}</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={32} defaultValue={phone ?? ""} className={inputClass} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="language" className={labelClass}>{t.language}</label>
        <select id="language" name="language" defaultValue={language} className={inputClass}>
          <option value="mn">{t.languages.mn}</option>
          <option value="en">{t.languages.en}</option>
        </select>
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-700">{t.profileErrors[state.error]}</p>}
      {state?.saved && <p role="status" className="text-sm text-emerald-700">{t.profileSaved}</p>}
      <button type="submit" disabled={pending} className={`w-fit ${primaryButton}`}>{t.saveProfile}</button>
    </form>
  );
}
