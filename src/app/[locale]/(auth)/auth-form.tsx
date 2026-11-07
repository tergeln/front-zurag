"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { signIn, signUp, type AuthErrorKey } from "./actions";

type Props = {
  mode: "login" | "signup";
  locale: Locale;
  t: Dictionary["auth"];
  next?: string;
  initialError?: AuthErrorKey;
};

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-[15px] text-zinc-900 outline-none transition-colors duration-200 placeholder:text-zinc-400 focus:border-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/10";

export function AuthForm({ mode, locale, t, next, initialError }: Props) {
  const [state, action, pending] = useActionState(mode === "login" ? signIn : signUp, initialError ? { error: initialError } : undefined);

  if (state?.sentTo) {
    return (
      <p role="status" className="rounded-lg border border-zinc-200 bg-white p-4 text-[15px] leading-relaxed text-zinc-700">
        {t.checkEmail.replace("{email}", state.sentTo)}
      </p>
    );
  }

  const isSignup = mode === "signup";

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="locale" value={locale} />
      {next && <input type="hidden" name="next" value={next} />}

      {isSignup && (
        <div className="flex flex-col gap-2">
          <label htmlFor="fullName" className="text-sm font-medium text-zinc-800">{t.fullName}</label>
          <input id="fullName" name="fullName" autoComplete="name" maxLength={120} defaultValue={state?.fullName} className={inputClass} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-800">{t.email}</label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state?.email} className={inputClass} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-zinc-800">{t.password}</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={isSignup ? 8 : undefined}
          autoComplete={isSignup ? "new-password" : "current-password"}
          aria-describedby={isSignup ? "password-help" : undefined}
          className={inputClass}
        />
        {isSignup && <p id="password-help" className="text-[13px] text-zinc-500">{t.passwordHelp}</p>}
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-red-700">{t.errors[state.error]}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-lg bg-zinc-900 px-4 py-3 text-[15px] font-medium text-white transition-[transform,background-color] duration-200 hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? t.pending : isSignup ? t.submitSignup : t.submitLogin}
      </button>

      <p className="text-sm text-zinc-600">
        {isSignup ? t.haveAccount : t.noAccount}{" "}
        <Link href={`/${locale}/${isSignup ? "login" : "signup"}`} className="font-medium text-zinc-900 underline underline-offset-4 hover:text-[var(--color-accent)]">
          {isSignup ? t.submitLogin : t.submitSignup}
        </Link>
      </p>
    </form>
  );
}
