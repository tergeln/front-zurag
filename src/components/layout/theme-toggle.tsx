"use client";

import { useEffect } from "react";
import { THEME_COOKIE } from "@/lib/theme";

const BURN_MASK = "/images/burn-mask.png"; // also named in globals.css (.theme-burn)

/**
 * Light / dark switch. The theme is set on <html data-theme> by a tiny script
 * before the page draws (saved choice, else the device setting); this button
 * flips it and remembers the choice for a year. Where the browser supports
 * view transitions, the new theme burns in from the right (see globals.css).
 */
export function ThemeToggle({ label }: { label: string }) {
  // Load the burn mask ahead of the first click, so the effect never starts blank.
  useEffect(() => {
    new Image().src = BURN_MASK;
  }, []);

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        const root = document.documentElement;
        const next = root.dataset.theme === "dark" ? "light" : "dark";
        const apply = () => {
          root.dataset.theme = next;
        };
        document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;

        const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (calm || !document.startViewTransition || root.classList.contains("theme-burn")) {
          apply();
          return;
        }
        root.classList.add("theme-burn");
        document.startViewTransition(apply).finished.finally(() => root.classList.remove("theme-burn"));
      }}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 transition-colors duration-200 hover:text-zinc-950"
    >
      {/* Moon in light mode (switch to dark), sun in dark mode (switch to light). */}
      <svg viewBox="0 0 24 24" aria-hidden className="size-[18px] dark:hidden" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      <svg viewBox="0 0 24 24" aria-hidden className="hidden size-[18px] dark:block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
