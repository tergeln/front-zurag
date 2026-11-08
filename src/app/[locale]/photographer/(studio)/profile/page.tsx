import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireApprovedPhotographer } from "@/lib/auth/photographer";
import { PageIntro } from "@/components/layout/page-intro";
import Link from "next/link";
import { textLink } from "@/components/ui/styles";
import { ProfileForm } from "./profile-form";

export default async function StudioProfilePage({ params }: PageProps<"/[locale]/photographer/profile">) {
  const locale = resolveLocale((await params).locale);
  const { profile } = await requireApprovedPhotographer(locale, `/${locale}/photographer/profile`);
  const dict = getDictionary(locale);

  return (
    <PageIntro title={dict.studio.profileTitle} lead={dict.studio.profileLead}>
      <Link href={`/${locale}/photographers/${profile.slug}`} className={`${textLink} w-fit text-sm`}>{dict.studio.publicPage} →</Link>
      <ProfileForm
        locale={locale}
        t={dict.photographer}
        studio={dict.studio}
        defaults={{
          displayName: profile.display_name,
          contactEmail: profile.contact_email ?? "",
          phone: profile.phone ?? "",
          bio: profile.bio ?? "",
          portfolio: profile.portfolio_urls.join("\n"),
        }}
      />
    </PageIntro>
  );
}
