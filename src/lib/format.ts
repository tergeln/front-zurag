import type { Locale } from "@/i18n/config";

export function formatDate(iso: string, locale: Locale, withTime = false): string {
  return new Intl.DateTimeFormat(locale === "mn" ? "mn-MN" : "en-GB", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
    timeZone: "Asia/Ulaanbaatar",
  }).format(new Date(iso));
}
