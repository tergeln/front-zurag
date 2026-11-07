import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireUser } from "@/lib/auth/session";
import { getPhotographerProfile } from "@/lib/auth/photographer";
import { PageIntro } from "@/components/layout/page-intro";
import { textLink } from "@/components/ui/styles";
import { hasBiometricConsent } from "@/lib/public/queries";
import { withdrawBiometricConsent } from "@/lib/public/actions";
import { deleteMyAccount } from "@/lib/account/actions";

const DELETE_ERRORS = ["admin_cannot_delete", "photographer_contact_admin", "confirm_required", "generic"] as const;

export default async function AccountPage({ params, searchParams }: PageProps<"/[locale]/account">) {
  const locale = resolveLocale((await params).locale);
  const { delete: deleteParam } = await searchParams;
  const deleteError = DELETE_ERRORS.find((k) => k === deleteParam);
  const del = getDictionary(locale).deleteAccount;
  const user = await requireUser(locale, `/${locale}/account`);
  const [photographer, consent] = await Promise.all([getPhotographerProfile(user.id), hasBiometricConsent()]);
  const t = getDictionary(locale).account;
  const role = user.profile?.role ?? "customer";

  return (
    <PageIntro title={t.title} lead={user.profile?.full_name || user.email}>
      <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-8 gap-y-3 border-t border-zinc-200 pt-6 text-[15px]">
        <dt className="text-zinc-500">Email</dt>
        <dd className="text-zinc-900">{user.email}</dd>
        <dt className="text-zinc-500">{t.role}</dt>
        <dd className="text-zinc-900">{t.roles[role]}</dd>
      </dl>
      <p className="max-w-[60ch] rounded-2xl border border-dashed border-zinc-300 p-6 leading-relaxed text-zinc-600">{t.emptyPurchases}</p>

      <form action={withdrawBiometricConsent} className="flex max-w-[60ch] flex-col gap-2 border-t border-zinc-200 pt-6">
        <input type="hidden" name="locale" value={locale} />
        <h2 className="text-lg font-semibold text-zinc-950">{t.biometricTitle}</h2>
        <p className="leading-relaxed text-zinc-600">{consent ? t.biometricOn : t.biometricOff}</p>
        {consent && <button type="submit" className={`${textLink} w-fit text-sm`}>{t.biometricWithdraw}</button>}
      </form>

      {role !== "admin" && (
        <form action={deleteMyAccount} className="flex max-w-[60ch] flex-col gap-3 rounded-2xl border border-red-200 bg-red-50/40 p-6">
          <input type="hidden" name="locale" value={locale} />
          <h2 className="text-lg font-semibold text-zinc-950">{del.title}</h2>
          <p className="text-sm leading-relaxed text-zinc-700">{del.body}</p>
          <label className="flex items-start gap-3 text-sm text-zinc-800">
            <input type="checkbox" name="confirm" required className="mt-1 size-4 accent-red-700" />
            <span>{del.confirm}</span>
          </label>
          {deleteError && <p role="alert" className="text-sm text-red-700">{del.errors[deleteError]}</p>}
          <button type="submit" className="w-fit rounded-lg border border-red-300 bg-white px-4 py-2.5 text-[15px] font-medium text-red-700 hover:bg-red-50">{del.submit}</button>
        </form>
      )}

      {role !== "admin" && (
        <div className="flex max-w-[60ch] flex-col gap-2 border-t border-zinc-200 pt-6">
          <h2 className="text-lg font-semibold text-zinc-950">{t.becomePhotographer}</h2>
          {photographer ? (
            <Link href={`/${locale}/photographer/status`} className={`${textLink} w-fit`}>{t.viewStatus}</Link>
          ) : (
            <>
              <p className="leading-relaxed text-zinc-600">{t.becomePhotographerBody}</p>
              <Link href={`/${locale}/photographer/apply`} className={`${textLink} w-fit`}>{getDictionary(locale).photographer.applyCta}</Link>
            </>
          )}
        </div>
      )}
    </PageIntro>
  );
}
