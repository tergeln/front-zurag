import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireUser } from "@/lib/auth/session";
import { getCart } from "@/lib/public/queries";
import { removeFromCartForm } from "@/lib/public/actions";
import { formatMnt } from "@/lib/money";
import { PageIntro } from "@/components/layout/page-intro";
import { primaryButton, textLink } from "@/components/ui/styles";

export default async function CartPage({ params }: PageProps<"/[locale]/cart">) {
  const locale = resolveLocale((await params).locale);
  await requireUser(locale, `/${locale}/cart`);
  const dict = getDictionary(locale);
  const t = dict.cart;
  const rows = await getCart();
  const available = rows.filter((r) => r.available);
  const total = available.reduce((sum, r) => sum + Number(r.price_mnt), 0);

  if (!rows.length) {
    return (
      <PageIntro title={t.title}>
        <p className="text-zinc-600">{t.empty}</p>
        <Link href={`/${locale}/events`} className={`${primaryButton} w-fit`}>{t.browse}</Link>
      </PageIntro>
    );
  }

  return (
    <PageIntro title={t.title} lead={t.count.replace("{n}", String(rows.length))}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
          {rows.map((r) => (
            <li key={r.photo_id} className="flex items-center gap-4 p-4">
              <Link href={`/${locale}/photos/${r.photo_id}`} className="size-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element -- signed, short-lived R2 URL via redirect */}
                <img src={`/api/photos/${r.photo_id}/image?variant=thumb`} alt="" loading="lazy" className="size-full object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Link href={`/${locale}/events/${r.event_slug}`} className="truncate text-zinc-900 hover:underline">
                  {locale === "en" && r.event_name_en ? r.event_name_en : r.event_name_mn}
                </Link>
                <span className="text-sm text-zinc-500">{r.owner_name ?? dict.gallery.company}</span>
                {!r.available && <span className="text-sm text-red-700">{t.unavailable}</span>}
              </div>
              <span className={`font-mono text-zinc-950 ${r.available ? "" : "line-through opacity-50"}`}>{formatMnt(Number(r.price_mnt))}₮</span>
              <form action={removeFromCartForm}>
                <input type="hidden" name="photoId" value={r.photo_id} />
                <button type="submit" className="text-sm text-zinc-600 underline underline-offset-4 hover:text-red-700">{t.remove}</button>
              </form>
            </li>
          ))}
        </ul>

        <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-baseline justify-between">
            <span className="text-zinc-600">{t.total}</span>
            <span className="font-mono text-2xl text-zinc-950">{formatMnt(total)}₮</span>
          </div>
          <button type="button" disabled className={`${primaryButton} w-full cursor-not-allowed opacity-50`}>{t.checkout}</button>
          <p className="text-sm text-zinc-500">{t.checkoutSoon}</p>
          <Link href={`/${locale}/events`} className={`${textLink} text-sm`}>{t.browse}</Link>
        </aside>
      </div>
    </PageIntro>
  );
}
