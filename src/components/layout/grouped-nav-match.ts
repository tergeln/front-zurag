export type NavGroup = { label: string; items: { href: string; label: string }[] };

/**
 * Which section and page are highlighted. A page belongs to an item when it is
 * that page or below it (e.g. /admin/events/123). The very first item is the
 * dashboard root, so it is matched exactly.
 */
export function activeNav(groups: NavGroup[], pathname: string) {
  const root = groups[0]?.items[0]?.href;
  const isActive = (href: string) => (href === root ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
  const current = groups.find((g) => g.items.some((i) => isActive(i.href))) ?? groups[0];
  return { current, isActive };
}
