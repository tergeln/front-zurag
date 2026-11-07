import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { SubNav } from "@/components/layout/sub-nav";

// Navigation only. Each admin page checks requireRole('admin') itself.
export default async function AdminLayout({ children, params }: LayoutProps<"/[locale]/admin">) {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).admin.nav;
  const base = `/${locale}/admin`;

  return (
    <>
      <SubNav
        label="Admin"
        items={[
          { href: base, label: t.overview },
          { href: `${base}/events`, label: t.events },
          { href: `${base}/orders`, label: t.orders },
          { href: `${base}/revenue`, label: t.revenue },
          { href: `${base}/payouts`, label: t.payouts },
          { href: `${base}/applications`, label: t.applications },
          { href: `${base}/photographers`, label: t.photographers },
          { href: `${base}/users`, label: t.users },
          { href: `${base}/settings`, label: t.settings },
          { href: `${base}/audit`, label: t.audit },
        ]}
      />
      {children}
    </>
  );
}
