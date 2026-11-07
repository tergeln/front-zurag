import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { getCurrentUser } from "@/lib/auth/session";
import { signOut } from "@/app/[locale]/(auth)/actions";
import { LocaleSwitch } from "./locale-switch";

const linkClass = "rounded-md px-3 py-2 text-sm text-zinc-700 transition-colors duration-200 hover:text-zinc-950";

export async function SiteHeader({ locale, t }: { locale: Locale; t: Dictionary["nav"] }) {
  const user = await getCurrentUser();
  const role = user?.profile?.status === "active" ? user.profile.role : undefined;

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-[var(--color-paper)]/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link href={`/${locale}`} className="text-lg font-semibold tracking-tight text-zinc-950">
          Zurag<span className="text-[var(--color-accent)]">.</span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          <Link href={`/${locale}#photographers`} className={`${linkClass} hidden md:inline-block`}>{t.photographers}</Link>
          <LocaleSwitch locale={locale} label={t.language} className={linkClass} />

          {user ? (
            <>
              {role === "admin" && <Link href={`/${locale}/admin`} className={linkClass}>{t.admin}</Link>}
              {role === "photographer" && <Link href={`/${locale}/photographer`} className={linkClass}>{t.dashboard}</Link>}
              <Link href={`/${locale}/account`} className={linkClass}>{t.account}</Link>
              <form action={signOut}>
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" className={linkClass}>{t.logout}</button>
              </form>
            </>
          ) : (
            <>
              <Link href={`/${locale}/login`} className={linkClass}>{t.login}</Link>
              <Link
                href={`/${locale}/signup`}
                className="ml-1 rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-[transform,background-color] duration-200 hover:bg-zinc-800 active:scale-[0.98]"
              >
                {t.signup}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
