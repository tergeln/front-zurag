"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/i18n/config";

/** Links to the same page in the other language and remembers the choice. */
export function LocaleSwitch({ locale, label, className }: { locale: Locale; label: string; className?: string }) {
  const pathname = usePathname();
  const other: Locale = locale === "mn" ? "en" : "mn";
  const href = pathname.replace(/^\/(mn|en)(?=\/|$)/, `/${other}`);

  return (
    <Link
      href={href}
      hrefLang={other}
      className={className}
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${other}; path=/; max-age=31536000; samesite=lax`;
      }}
    >
      {label}
    </Link>
  );
}
