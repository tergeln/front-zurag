"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeNav, type NavGroup } from "./grouped-nav-match";

/** Two-level dashboard navigation: section pills, then the pages of the current section. */
export function GroupedNav({ label, groups }: { label: string; groups: NavGroup[] }) {
  const pathname = usePathname();
  const { current, isActive } = activeNav(groups, pathname);

  return (
    <nav aria-label={label} className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 pt-6 md:px-8">
      <div className="no-scrollbar flex gap-1 overflow-x-auto">
        {groups.map((g) => {
          const active = g === current;
          return (
            <Link
              key={g.label}
              href={g.items[0].href}
              aria-current={active ? "true" : undefined}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors duration-200 ${
                active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900"
              }`}
            >
              {g.label}
            </Link>
          );
        })}
      </div>
      {current.items.length > 1 && (
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-zinc-200">
          {current.items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors duration-200 ${
                  active ? "border-zinc-900 font-medium text-zinc-950" : "border-transparent text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
