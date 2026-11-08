import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { PhotographerStatus } from "@/lib/auth/roles";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { PageIntro } from "@/components/layout/page-intro";
import { secondaryButton } from "@/components/ui/styles";
import { formatDate } from "@/lib/format";
import { revokeInvitation, setPhotographerStatus } from "../actions";
import { InviteForm } from "./invite-form";

type Photographer = {
  user_id: string;
  display_name: string;
  contact_email: string | null;
  status: PhotographerStatus;
  source: "application" | "invitation";
  approved_at: string | null;
};

type Invitation = { id: string; email: string; expires_at: string; accepted_at: string | null; revoked_at: string | null; created_at: string };

const ERROR_KEYS = ["forbidden", "notOpen", "invalidEmail", "generic"] as const;

function inviteState(inv: Invitation): "open" | "accepted" | "revoked" | "expired" {
  if (inv.accepted_at) return "accepted";
  if (inv.revoked_at) return "revoked";
  if (new Date(inv.expires_at) < new Date()) return "expired";
  return "open";
}

export default async function PhotographersPage({ params, searchParams }: PageProps<"/[locale]/admin/photographers">) {
  const locale = resolveLocale((await params).locale);
  await requireRole(locale, `/${locale}/admin/photographers`, "admin");
  const { error } = await searchParams;
  const dict = getDictionary(locale);
  const t = dict.admin.photographers;

  const supabase = await createClient();
  const [photographers, invitations] = await Promise.all([
    supabase
      .from("photographer_profiles")
      .select("user_id, display_name, contact_email, status, source, approved_at")
      .in("status", ["approved", "suspended"])
      .order("approved_at", { ascending: false })
      .returns<Photographer[]>(),
    supabase.from("photographer_invitations").select("id, email, expires_at, accepted_at, revoked_at, created_at").order("created_at", { ascending: false }).limit(30).returns<Invitation[]>(),
  ]);
  const errorKey = ERROR_KEYS.find((k) => k === error);

  return (
    <PageIntro title={t.title} lead={t.lead}>
      {errorKey && <p role="alert" className="text-sm text-red-700">{dict.admin.errors[errorKey]}</p>}

      {photographers.data?.length ? (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-medium">{t.name}</th>
                <th className="px-5 py-3 font-medium">{t.source}</th>
                <th className="px-5 py-3 font-medium">{t.status}</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {photographers.data.map((p) => (
                <tr key={p.user_id}>
                  <td className="px-5 py-3">
                    <div className="text-zinc-900">{p.display_name}</div>
                    <div className="text-zinc-500">{p.contact_email}</div>
                  </td>
                  <td className="px-5 py-3 text-zinc-600">{t.sources[p.source]}</td>
                  <td className="px-5 py-3">
                    <span className={p.status === "approved" ? "text-emerald-700" : "text-red-700"}>{t.statuses[p.status]}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={setPhotographerStatus}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="userId" value={p.user_id} />
                      <input type="hidden" name="status" value={p.status === "approved" ? "suspended" : "approved"} />
                      {p.status === "approved" ? (
                        <ConfirmButton message={t.suspendConfirm} className={`${secondaryButton} py-1.5 text-sm`}>{t.suspend}</ConfirmButton>
                      ) : (
                        <button type="submit" className={`${secondaryButton} py-1.5 text-sm`}>{t.reinstate}</button>
                      )}
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600">{t.empty}</p>
      )}

      <section className="flex max-w-2xl flex-col gap-4 border-t border-zinc-200 pt-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-zinc-950">{t.inviteTitle}</h2>
          <p className="leading-relaxed text-zinc-600">{t.inviteBody}</p>
        </div>
        <InviteForm locale={locale} t={t} errors={dict.admin.errors} />

        <h3 className="mt-4 text-sm font-medium text-zinc-500">{t.invitations}</h3>
        {invitations.data?.length ? (
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200 text-sm">
            {invitations.data.map((inv) => {
              const state = inviteState(inv);
              return (
                <li key={inv.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 py-3">
                  <span className="flex-1 text-zinc-900">{inv.email}</span>
                  <span className="text-zinc-500">{formatDate(inv.created_at, locale)}</span>
                  <span className={state === "accepted" ? "text-emerald-700" : "text-zinc-600"}>{t.inviteStatuses[state]}</span>
                  {state === "open" && (
                    <form action={revokeInvitation}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="invitationId" value={inv.id} />
                      <ConfirmButton message={t.revokeConfirm} className="text-zinc-600 underline underline-offset-4 hover:text-red-700">{t.revoke}</ConfirmButton>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">{t.noInvites}</p>
        )}
      </section>
    </PageIntro>
  );
}
