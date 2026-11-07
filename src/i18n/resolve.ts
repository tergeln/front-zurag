import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";

/** Turns the [locale] route param into a Locale, or 404s for anything else (e.g. /fr). */
export function resolveLocale(value: string): Locale {
  if (!isLocale(value)) notFound();
  return value;
}
