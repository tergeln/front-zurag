import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";

export function SiteFooter({ locale, t }: { locale: Locale; t: Dictionary }) {
  const links = [
    { href: `/${locale}/photographers`, label: t.footer.photographers },
    { href: `/${locale}/terms`, label: t.footer.terms },
    { href: `/${locale}/privacy`, label: t.footer.privacy },
    { href: `/${locale}/contact`, label: t.footer.contact },
  ];
  return (
    <footer className="border-t border-zinc-200/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between md:px-8">
        <p>
          <span className="font-medium text-zinc-800">Zurag</span> · {t.home.tagline.join(" ")}
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-zinc-900">{l.label}</Link>
          ))}
        </nav>
        <p>© {new Date().getFullYear()} Zurag. {t.footer.rights}</p>
      </div>
    </footer>
  );
}
