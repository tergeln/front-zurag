import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/[locale]/(auth)/actions";
import { getDictionary } from "@/i18n/get-dictionary";
import { LocaleSwitch } from "./locale-switch";
import { StaffNav } from "./staff-nav";
import { staffNavGroups } from "./staff-nav-groups";

const linkClass = "rounded-md px-3 py-2 text-sm text-zinc-700 transition-colors duration-200 hover:text-zinc-950";

async function counts(): Promise<{ unread: number; cart: number }> {
  const supabase = await createClient();
  const [n, c] = await Promise.all([
    supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null),
    supabase.from("cart_items").select("photo_id", { count: "exact", head: true }),
  ]);
  return { unread: n.count ?? 0, cart: c.count ?? 0 };
}

export async function SiteHeader({ locale, t }: { locale: Locale; t: Dictionary["nav"] }) {
  const user = await getCurrentUser();
  const role = user?.profile?.status === "active" ? user.profile.role : undefined;
  const staff = role === "admin" || role === "photographer";
  const { unread, cart } = user ? await counts() : { unread: 0, cart: 0 };

  const notificationsLink = (
    <Link href={`/${locale}/notifications`} className={`${linkClass} inline-flex items-center gap-1.5`}>
      {t.notifications}
      {unread > 0 && <span className="rounded-full bg-[var(--color-accent)] px-1.5 font-mono text-[11px] leading-5 text-white">{unread}</span>}
    </Link>
  );
  const logoutForm = (
    <form action={signOut}>
      <input type="hidden" name="locale" value={locale} />
      <button type="submit" className={linkClass}>{t.logout}</button>
    </form>
  );

  // Admins and photographers: one bar with only their own pages.
  if (staff) {
    return (
      <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-[var(--color-paper)]/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <Link href={`/${locale}/${role === "admin" ? "admin" : "photographer"}`} className="text-lg font-semibold tracking-tight text-zinc-950">
            Zurag<span className="text-[var(--color-accent)]">.</span>
          </Link>
          <StaffNav
            groups={staffNavGroups(role, locale, getDictionary(locale))}
            menuLabel={t.menu}
            utilities={
              <>
                {notificationsLink}
                <LocaleSwitch locale={locale} label={t.language} className={linkClass} />
                <Link href={`/${locale}/account`} className={linkClass}>{t.account}</Link>
                {logoutForm}
              </>
            }
          />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-[var(--color-paper)]/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link href={`/${locale}`} className="text-lg font-semibold tracking-tight text-zinc-950">
          Zurag<span className="text-[var(--color-accent)]">.</span>
        </Link>

        <nav aria-label="Main" className="no-scrollbar -mr-2 flex min-w-0 items-center gap-1 overflow-x-auto whitespace-nowrap">
          <Link href={`/${locale}/events`} className={linkClass}>{t.events}</Link>
          <Link href={`/${locale}#photographers`} className={`${linkClass} hidden lg:inline-block`}>{t.photographers}</Link>

          {user ? (
            <>
              <Link href={`/${locale}/downloads`} className={linkClass}>{t.myPhotos}</Link>
              <Link href={`/${locale}/cart`} className={`${linkClass} inline-flex items-center gap-1.5`}>
                {t.cart}
                {cart > 0 && <span className="rounded-full bg-zinc-900 px-1.5 font-mono text-[11px] leading-5 text-white">{cart}</span>}
              </Link>
              {notificationsLink}
              <LocaleSwitch locale={locale} label={t.language} className={linkClass} />
              <Link href={`/${locale}/account`} className={linkClass}>{t.account}</Link>
              {logoutForm}
            </>
          ) : (
            <>
              <LocaleSwitch locale={locale} label={t.language} className={linkClass} />
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
