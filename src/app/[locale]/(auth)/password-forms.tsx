"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { requestPasswordReset, setNewPassword } from "@/lib/account/actions";
import { inputClass, labelClass, helpClass, primaryButton, textLink } from "@/components/ui/styles";

type Props = { locale: Locale; t: Dictionary["auth"] };

export function ForgotPasswordForm({ locale, t }: Props) {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="locale" value={locale} />
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClass}>{t.email}</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </div>
      {state?.sentTo && (
        <p role="status" className="rounded-lg border border-zinc-200 bg-white p-4 text-[15px] leading-relaxed text-zinc-700">{t.forgotSent.replace("{email}", state.sentTo)}</p>
      )}
      {state?.error && <p role="alert" className="text-sm text-red-700">{t.errors[state.error]}</p>}
      <button type="submit" disabled={pending} className={`mt-1 py-3 ${primaryButton}`}>{pending ? t.pending : t.forgotSubmit}</button>
      <Link href={`/${locale}/login`} className={`${textLink} w-fit text-sm`}>{t.backToLogin}</Link>
    </form>
  );
}

export function NewPasswordForm({ locale, t }: Props) {
  const [state, action, pending] = useActionState(setNewPassword, undefined);

  if (state?.done) {
    return (
      <div className="flex flex-col gap-4">
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-[15px] text-emerald-900">{t.resetDone}</p>
        <Link href={`/${locale}/account`} className={`${textLink} w-fit`}>{t.goToAccount}</Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="locale" value={locale} />
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={labelClass}>{t.newPassword}</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" aria-describedby="password-help" className={inputClass} />
        <p id="password-help" className={helpClass}>{t.passwordHelp}</p>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="confirm" className={labelClass}>{t.confirmPassword}</label>
        <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-700">{t.passwordErrors[state.error]}</p>}
      <button type="submit" disabled={pending} className={`mt-1 py-3 ${primaryButton}`}>{pending ? t.pending : t.resetSubmit}</button>
    </form>
  );
}
