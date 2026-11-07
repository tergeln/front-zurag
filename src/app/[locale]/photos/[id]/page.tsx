import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { getCurrentUser } from "@/lib/auth/session";
import { getCartPhotoIds, getPublicPhotos } from "@/lib/public/queries";
import { formatMnt } from "@/lib/money";
import { CartButton } from "@/components/gallery/cart-button";
import { textLink } from "@/components/ui/styles";

export default async function PhotoPage({ params }: PageProps<"/[locale]/photos/[id]">) {
  const { locale: rawLocale, id } = await params;
  const locale = resolveLocale(rawLocale);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const t = getDictionary(locale).gallery;

  const [photo] = await getPublicPhotos([id]);
  if (!photo) notFound();
  const user = await getCurrentUser();
  const cart = user ? await getCartPhotoIds() : new Set<string>();
  const eventName = locale === "en" && photo.event_name_en ? photo.event_name_en : photo.event_name_mn;
  const eventHref = `/${locale}/events/${photo.event_slug}`;

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-[1fr_320px] md:px-8 md:py-14">
      <div className="overflow-hidden rounded-2xl bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element -- signed, short-lived R2 URL via redirect */}
        <img
          src={`/api/photos/${photo.id}/image?variant=preview`}
          alt=""
          width={photo.width ?? undefined}
          height={photo.height ?? undefined}
          className="mx-auto max-h-[80dvh] w-auto object-contain"
        />
      </div>
      <aside className="flex flex-col gap-5">
        <Link href={eventHref} className={`${textLink} w-fit text-sm`}>← {eventName}</Link>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[15px]">
          <dt className="text-zinc-500">{t.price}</dt>
          <dd className="font-mono text-lg text-zinc-950">{formatMnt(Number(photo.price_mnt))}₮</dd>
          <dt className="text-zinc-500">{t.photographer}</dt>
          <dd className="text-zinc-900">{photo.owner_name ?? t.company}</dd>
        </dl>
        <CartButton photoId={photo.id} initialInCart={cart.has(photo.id)} loggedIn={!!user} loginHref={`/${locale}/login?next=${encodeURIComponent(`/${locale}/photos/${photo.id}`)}`} t={t} />
        <p className="text-sm leading-relaxed text-zinc-500">{t.watermarkNote}</p>
      </aside>
    </div>
  );
}
