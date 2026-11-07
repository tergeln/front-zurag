import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { SubNav } from "@/components/layout/sub-nav";

// Navigation only. Each studio page checks requireApprovedPhotographer() itself.
export default async function StudioLayout({ children, params }: LayoutProps<"/[locale]/photographer">) {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).studio.nav;
  const base = `/${locale}/photographer`;

  return (
    <>
      <SubNav
        label="Photographer"
        items={[
          { href: base, label: t.overview },
          { href: `${base}/events`, label: t.events },
          { href: `${base}/profile`, label: t.profile },
        ]}
      />
      {children}
    </>
  );
}
