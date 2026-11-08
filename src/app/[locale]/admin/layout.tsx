import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { GroupedNav } from "@/components/layout/grouped-nav";

// Navigation only. Each admin page checks requireRole('admin') itself.
export default async function AdminLayout({ children, params }: LayoutProps<"/[locale]/admin">) {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).admin.nav;
  const g = getDictionary(locale).admin.navGroups;
  const base = `/${locale}/admin`;

  return (
    <>
      <GroupedNav
        label="Admin"
        groups={[
          { label: g.overview, items: [{ href: base, label: t.overview }] },
          {
            label: g.content,
            items: [
              { href: `${base}/events`, label: t.events },
              { href: `${base}/photos`, label: t.photos },
            ],
          },
          {
            label: g.sales,
            items: [
              { href: `${base}/orders`, label: t.orders },
              { href: `${base}/revenue`, label: t.revenue },
              { href: `${base}/payouts`, label: t.payouts },
            ],
          },
          {
            label: g.people,
            items: [
              { href: `${base}/applications`, label: t.applications },
              { href: `${base}/photographers`, label: t.photographers },
              { href: `${base}/users`, label: t.users },
            ],
          },
          {
            label: g.system,
            items: [
              { href: `${base}/settings`, label: t.settings },
              { href: `${base}/audit`, label: t.audit },
            ],
          },
        ]}
      />
      {children}
    </>
  );
}
