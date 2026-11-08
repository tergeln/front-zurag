"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { sendEmailCode, verifyEmailCode, type EmailCodeState } from "@/lib/account/actions";
import { inputClass, labelClass, primaryButton, secondaryButton } from "@/components/ui/styles";

type Props = { locale: Locale; email: string; t: Dictionary["verifyEmail"] };

/** Step 1: email a 6-digit code. Step 2: type it in. Then the page reloads without this box. */
export function EmailVerify({ locale, email, t }: Props) {
  const router = useRouter();
  const [sendState, send, sending] = useActionState<EmailCodeState, FormData>(sendEmailCode, undefined);
  const [checkState, check, checking] = useActionState<EmailCodeState, FormData>(verifyEmailCode, undefined);
  const sent = sendState?.sent || checkState?.sent;
  const error = checkState?.error ?? sendState?.error;

  useEffect(() => {
    if (checkState?.verified) router.refresh();
  }, [checkState?.verified, router]);

  return (
    <div className="flex max-w-xl flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-zinc-950">{t.title}</h2>
      <p className="leading-relaxed text-zinc-600">{t.body.replace("{email}", email)}</p>

      <form action={send}>
        <input type="hidden" name="locale" value={locale} />
        <button type="submit" disabled={sending} className={sent ? secondaryButton : primaryButton}>
          {sending ? t.sending : sent ? t.resend : t.send}
        </button>
      </form>

      {sent && (
        <form action={check} className="flex flex-col gap-3">
          <input type="hidden" name="locale" value={locale} />
          <p className="text-sm text-zinc-600">{t.sent.replace("{email}", email)}</p>
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className={labelClass}>{t.code}</label>
            <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={12} required className={`${inputClass} w-48 font-mono tracking-widest`} />
          </div>
          <button type="submit" disabled={checking} className={`${primaryButton} w-fit`}>{checking ? t.checking : t.verify}</button>
        </form>
      )}

      {error && <p role="alert" className="text-sm text-red-700">{t.errors[error]}</p>}
      {checkState?.verified && <p role="status" className="text-sm text-emerald-700">{t.done}</p>}
    </div>
  );
}
