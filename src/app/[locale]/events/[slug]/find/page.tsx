import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { getCurrentUser } from "@/lib/auth/session";
import { getCartPhotoIds, getPublicEvent, listMyMatches } from "@/lib/public/queries";
import { PageIntro } from "@/components/layout/page-intro";
import { textLink } from "@/components/ui/styles";
import { SelfieSearch } from "./selfie-search";

// No account needed to search. Matches from the last 24 hours in this browser
// are shown again, so logging in to buy does not lose them.
export default async function FindPage({ params }: PageProps<"/[locale]/events/[slug]/find">) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const self = `/${locale}/events/${slug}/find`;
  const dict = getDictionary(locale);
  const t = dict.find;

  const event = await getPublicEvent(slug);
  if (!event) notFound();
  const eventHref = `/${locale}/events/${slug}`;
  if (event.locked) redirect(eventHref);
  const name = locale === "en" && event.name_en ? event.name_en : event.name_mn;
  const back = <Link href={eventHref} className={`${textLink} w-fit text-sm`}>← {name}</Link>;

  if (!event.face_search_enabled) {
    return (
      <PageIntro title={t.title}>
        {back}
        <p className="text-zinc-600">{t.errors.search_disabled}</p>
      </PageIntro>
    );
  }

  const user = await getCurrentUser();
  const [matches, cart] = await Promise.all([listMyMatches(event.id), user ? getCartPhotoIds() : Promise.resolve(new Set<string>())]);
  return (
    <PageIntro title={t.title} lead={t.lead}>
      {back}
      <SelfieSearch
        locale={locale}
        eventId={event.id}
        t={t}
        gallery={dict.gallery}
        cartIds={[...cart]}
        loggedIn={!!user}
        loginHref={`/${locale}/login?next=${encodeURIComponent(self)}`}
        initialPhotos={matches}
      />
    </PageIntro>
  );
}
