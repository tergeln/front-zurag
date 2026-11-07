import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireUser } from "@/lib/auth/session";
import { getLatestApplication, getPhotographerProfile } from "@/lib/auth/photographer";
import { PageIntro } from "@/components/layout/page-intro";
import { ApplyForm } from "./apply-form";

export default async function ApplyPage({ params }: PageProps<"/[locale]/photographer/apply">) {
  const locale = resolveLocale((await params).locale);
  const user = await requireUser(locale, `/${locale}/photographer/apply`);
  const [profile, application] = await Promise.all([getPhotographerProfile(user.id), getLatestApplication(user.id)]);

  // Already approved, suspended or waiting for review: nothing to apply for.
  if (profile && (profile.status === "approved" || profile.status === "suspended")) redirect(`/${locale}/photographer/status`);
  if (application?.status === "submitted") redirect(`/${locale}/photographer/status`);

  const dict = getDictionary(locale);
  const t = dict.photographer;
  return (
    <PageIntro title={t.applyTitle} lead={t.applyLead}>
      <ApplyForm
        locale={locale}
        t={t}
        pendingLabel={dict.auth.pending}
        defaults={{
          displayName: profile?.display_name ?? user.profile?.full_name ?? "",
          contactEmail: profile?.contact_email ?? user.email ?? "",
          phone: profile?.phone ?? "",
          bio: profile?.bio ?? "",
          portfolio: profile?.portfolio_urls.join("\n") ?? "",
        }}
      />
    </PageIntro>
  );
}
