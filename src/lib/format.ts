import type { Locale } from "@/i18n/config";

/** Today's date in Ulaanbaatar (UTC+8) as YYYY-MM-DD. */
export function todayInUlaanbaatar(): string {
  return new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10);
}

export function formatDate(iso: string, locale: Locale, withTime = false): string {
  return new Intl.DateTimeFormat(locale === "mn" ? "mn-MN" : "en-GB", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
    timeZone: "Asia/Ulaanbaatar",
  }).format(new Date(iso));
}
