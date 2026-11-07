import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getDictionary } from "@/i18n/get-dictionary";
import { locales } from "@/i18n/config";
import { resolveLocale } from "@/i18n/resolve";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "cyrillic"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "cyrillic"] });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const t = getDictionary(resolveLocale((await params).locale)).meta;
  return { title: t.title, description: t.description };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale);

  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2">
          {locale === "mn" ? "Үндсэн агуулга руу шилжих" : "Skip to content"}
        </a>
        <SiteHeader locale={locale} t={t.nav} />
        <main id="main" className="flex flex-1 flex-col">{children}</main>
        <SiteFooter t={t} />
      </body>
    </html>
  );
}
