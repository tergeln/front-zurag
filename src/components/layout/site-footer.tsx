import Link from "next/link";
import { BrandLogo } from "./brand-logo";
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
    <footer id="footer" className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-identity">
            <Link href={`/${locale}`} className="brand-wordmark footer-brand text-zinc-800"><BrandLogo /></Link>
            <p className="footer-tagline">{t.home.tagline.join(" ")}</p>
          </div>
          <nav aria-label="Footer" className="footer-links">
            {links.map((l) => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Zurag. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
