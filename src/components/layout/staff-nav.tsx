"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeNav, type NavGroup } from "./grouped-nav-match";

const itemClass = "whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors duration-200";
const idle = "text-zinc-700 hover:text-zinc-950";
const on = "bg-zinc-900 text-white";

/**
 * The single menu bar for admins and photographers: their dashboard sections
 * (sections with several pages open a small list), then `utilities`
 * (notifications, language, account, log out). On phones everything sits
 * behind one menu button.
 */
export function StaffNav({ groups, utilities, menuLabel }: { groups: NavGroup[]; utilities: ReactNode; menuLabel: string }) {
  const pathname = usePathname();
  const { current, isActive } = activeNav(groups, pathname);
  // Open dropdown (desktop) or "mobile", remembered with the page it was opened on,
  // so moving to another page closes it.
  const [state, setState] = useState<{ key: string; path: string } | null>(null);
  const open = state?.path === pathname ? state.key : null;
  const setOpen = (key: string | null) => setState(key ? { key, path: pathname } : null);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click and Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setState(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setState(null);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="flex min-w-0 items-center">
      {/* Desktop: one row */}
      <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
        {groups.map((g) =>
          g.items.length === 1 ? (
            <Link key={g.label} href={g.items[0].href} aria-current={g === current ? "page" : undefined} className={`${itemClass} ${g === current ? on : idle}`}>
              {g.label}
            </Link>
          ) : (
            <div key={g.label} className="relative">
              <button
                type="button"
                aria-expanded={open === g.label}
                onClick={() => setOpen(open === g.label ? null : g.label)}
                className={`${itemClass} inline-flex items-center gap-1 ${g === current ? on : idle}`}
              >
                {g.label}
                <span aria-hidden className="text-[10px] opacity-70">▾</span>
              </button>
              {open === g.label && (
                <div className="absolute left-0 top-full z-40 mt-1 flex min-w-48 flex-col rounded-xl border border-zinc-200 bg-white p-1 shadow-lg">
                  {g.items.map((i) => (
                    <Link
                      key={i.href}
                      href={i.href}
                      aria-current={isActive(i.href) ? "page" : undefined}
                      className={`rounded-lg px-3 py-2 text-sm ${isActive(i.href) ? "bg-zinc-100 font-medium text-zinc-950" : "text-zinc-700 hover:bg-zinc-50"}`}
                    >
                      {i.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ),
        )}
        <span aria-hidden className="mx-2 h-5 w-px bg-zinc-200" />
        {utilities}
      </nav>

      {/* Phones and small screens: one menu button */}
      <div className="relative lg:hidden">
        <button
          type="button"
          aria-expanded={open === "mobile"}
          onClick={() => setOpen(open === "mobile" ? null : "mobile")}
          className="rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-900"
        >
          {menuLabel}
        </button>
        {open === "mobile" && (
          <div className="fixed inset-x-4 top-16 z-40 flex max-h-[calc(100dvh-5rem)] flex-col gap-3 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg">
            {groups.map((g) => (
              <div key={g.label} className="flex flex-col">
                {g.items.length > 1 && <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">{g.label}</p>}
                {g.items.map((i) => (
                  <Link
                    key={i.href}
                    href={i.href}
                    aria-current={isActive(i.href) ? "page" : undefined}
                    className={`rounded-lg px-3 py-2 text-[15px] ${isActive(i.href) ? "bg-zinc-100 font-medium text-zinc-950" : "text-zinc-800"}`}
                  >
                    {i.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-1 border-t border-zinc-200 pt-3">{utilities}</div>
          </div>
        )}
      </div>
    </div>
  );
}
