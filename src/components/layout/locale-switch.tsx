"use client";

import { useId } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, locales, type Locale } from "@/i18n/config";

function MongoliaFlag() {
  // Red-blue-red with the Soyombo simplified to a gold mark (readable at 18px).
  return (
    <svg viewBox="0 0 30 30" aria-hidden className="size-full">
      <rect width="10" height="30" fill="#C4272F" />
      <rect x="10" width="10" height="30" fill="#015197" />
      <rect x="20" width="10" height="30" fill="#C4272F" />
      <circle cx="5" cy="9" r="2" fill="#F9CF02" />
      <rect x="3" y="12.5" width="4" height="9" rx="0.6" fill="#F9CF02" />
    </svg>
  );
}

function UkFlag() {
  const id = useId();
  return (
    <svg viewBox="15 0 30 30" aria-hidden className="size-full">
      <clipPath id={`${id}t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}t)`} stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

const flags: Record<Locale, () => React.JSX.Element> = { mn: MongoliaFlag, en: UkFlag };

/** MN / EN pill with flags. The current language is highlighted; tapping the other one switches and remembers it. */
export function LocaleSwitch({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();

  return (
    <div role="group" aria-label={label} title={label} className="inline-flex shrink-0 items-center rounded-full border border-zinc-300 bg-white p-0.5">
      {locales.map((l) => {
        const Flag = flags[l];
        const content = (
          <>
            <span className="size-[18px] overflow-hidden rounded-full ring-1 ring-black/10">
              <Flag />
            </span>
            <span>{l.toUpperCase()}</span>
          </>
        );
        const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide";
        if (l === locale) {
          return (
            <span key={l} aria-current="true" className={`${base} bg-zinc-900 text-white`}>
              {content}
            </span>
          );
        }
        return (
          <Link
            key={l}
            href={pathname.replace(/^\/(mn|en)(?=\/|$)/, `/${l}`)}
            hrefLang={l}
            lang={l}
            className={`${base} text-zinc-600 transition-colors duration-200 hover:text-zinc-950`}
            onClick={() => {
              document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
            }}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
