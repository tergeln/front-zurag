import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { AdminNav } from "./admin-nav";

// Navigation only. Each admin page checks requireRole('admin') itself.
export default async function AdminLayout({ children, params }: LayoutProps<"/[locale]/admin">) {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).admin.nav;
  const base = `/${locale}/admin`;

  return (
    <>
      <AdminNav
        items={[
          { href: base, label: t.overview },
          { href: `${base}/applications`, label: t.applications },
          { href: `${base}/photographers`, label: t.photographers },
        ]}
      />
      {children}
    </>
  );
}
