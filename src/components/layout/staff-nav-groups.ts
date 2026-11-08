import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import type { NavGroup } from "./grouped-nav-match";

/** The menu of an admin or photographer: their dashboard pages, grouped. */
export function staffNavGroups(role: "admin" | "photographer", locale: Locale, dict: Dictionary): NavGroup[] {
  if (role === "photographer") {
    const t = dict.studio.nav;
    const base = `/${locale}/photographer`;
    return [
      { label: t.overview, items: [{ href: base, label: t.overview }] },
      { label: t.events, items: [{ href: `${base}/events`, label: t.events }] },
      { label: t.sales, items: [{ href: `${base}/sales`, label: t.sales }] },
      { label: t.payouts, items: [{ href: `${base}/payouts`, label: t.payouts }] },
      { label: t.profile, items: [{ href: `${base}/profile`, label: t.profile }] },
    ];
  }

  const t = dict.admin.nav;
  const g = dict.admin.navGroups;
  const base = `/${locale}/admin`;
  return [
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
  ];
}
