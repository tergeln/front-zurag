import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Role, UserStatus } from "@/lib/auth/roles";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { PageIntro } from "@/components/layout/page-intro";
import { inputClass, secondaryButton, textLink } from "@/components/ui/styles";
import { formatDate } from "@/lib/format";
import { setUserStatus } from "../actions";

type UserRow = { id: string; email: string; full_name: string | null; role: Role; status: UserStatus; created_at: string; total: number };

const PAGE_SIZE = 25;
const ERROR_KEYS = ["forbidden", "notOpen", "invalidEmail", "cannotChangeSelf", "generic"] as const;

export default async function UsersPage({ params, searchParams }: PageProps<"/[locale]/admin/users">) {
  const locale = resolveLocale((await params).locale);
  const me = await requireRole(locale, `/${locale}/admin/users`, "admin");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";
  const page = Math.max(0, Number(sp.page) || 0);
  const dict = getDictionary(locale);
  const t = dict.admin.users;

  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_list_users", { p_search: q, p_limit: PAGE_SIZE, p_offset: page * PAGE_SIZE });
  const rows = (data ?? []) as UserRow[];
  const total = rows[0]?.total ?? 0;
  const errorKey = ERROR_KEYS.find((k) => k === sp.error);

  const base = `/${locale}/admin/users`;
  const link = (p: number) => `${base}?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;
  const back = link(page);

  return (
    <PageIntro title={t.title} lead={t.lead}>
      <form className="flex max-w-xl gap-2" role="search">
        <label htmlFor="q" className="sr-only">{t.search}</label>
        <input id="q" name="q" defaultValue={q} placeholder={t.search} className={inputClass} />
        <button type="submit" className={secondaryButton}>{t.searchButton}</button>
      </form>

      {errorKey && <p role="alert" className="text-sm text-red-700">{dict.admin.errors[errorKey]}</p>}

      {rows.length ? (
        <>
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-zinc-200 text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">{t.name}</th>
                  <th className="px-5 py-3 font-medium">{t.role}</th>
                  <th className="px-5 py-3 font-medium">{t.status}</th>
                  <th className="px-5 py-3 font-medium">{t.joined}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-3">
                      <div className="text-zinc-900">{u.full_name || "—"}</div>
                      <div className="text-zinc-500">{u.email}</div>
                    </td>
                    <td className="px-5 py-3 text-zinc-700">{dict.account.roles[u.role]}</td>
                    <td className="px-5 py-3">
                      <span className={u.status === "active" ? "text-emerald-700" : "text-red-700"}>{t.statuses[u.status]}</span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-zinc-500">{formatDate(u.created_at, locale)}</td>
                    <td className="px-5 py-3 text-right">
                      {u.id === me.id ? (
                        <span className="text-zinc-400">{t.you}</span>
                      ) : u.status !== "deleted" ? (
                        <form action={setUserStatus}>
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="userId" value={u.id} />
                          <input type="hidden" name="back" value={back} />
                          <input type="hidden" name="status" value={u.status === "active" ? "suspended" : "active"} />
                          {u.status === "active" ? (
                            <ConfirmButton message={t.suspendConfirm} className={`${secondaryButton} py-1.5 text-sm`}>{t.suspend}</ConfirmButton>
                          ) : (
                            <button type="submit" className={`${secondaryButton} py-1.5 text-sm`}>{t.activate}</button>
                          )}
                        </form>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-4 text-sm text-zinc-600">
            <span>
              {t.showing
                .replace("{from}", String(page * PAGE_SIZE + 1))
                .replace("{to}", String(page * PAGE_SIZE + rows.length))
                .replace("{total}", String(total))}
            </span>
            {page > 0 && <Link href={link(page - 1)} className={textLink}>{t.prev}</Link>}
            {(page + 1) * PAGE_SIZE < total && <Link href={link(page + 1)} className={textLink}>{t.next}</Link>}
          </div>
        </>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600">{t.empty}</p>
      )}
    </PageIntro>
  );
}
