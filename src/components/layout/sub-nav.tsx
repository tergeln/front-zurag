"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Pill navigation for dashboard sections (admin, photographer studio). */
export function SubNav({ label, items }: { label: string; items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="no-scrollbar mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto px-4 pt-6 md:px-8">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors duration-200 ${
              active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
