import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import type { PublicPhoto } from "@/lib/public/queries";
import { formatMnt } from "@/lib/money";
import { CartButton } from "./cart-button";

type Props = {
  locale: Locale;
  t: Dictionary["gallery"];
  photos: (PublicPhoto & { similarity?: number })[];
  cart: Set<string>;
  loggedIn: boolean;
  loginHref: string;
};

/** Watermarked thumbnails with price and an add-to-cart button. */
export function PhotoGrid({ locale, t, photos, cart, loggedIn, loginHref }: Props) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((p) => (
        <li key={p.id} className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <Link href={`/${locale}/photos/${p.id}`} className="block aspect-[4/3] bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element -- signed, short-lived R2 URL via redirect */}
            <img src={`/api/photos/${p.id}/image?variant=thumb`} alt="" loading="lazy" className="size-full object-cover" />
          </Link>
          <div className="flex flex-1 flex-col gap-2 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-sm text-zinc-950">{formatMnt(Number(p.price_mnt))}₮</span>
              <span className="truncate text-[13px] text-zinc-500">{p.owner_name ?? t.company}</span>
            </div>
            <CartButton photoId={p.id} initialInCart={cart.has(p.id)} loggedIn={loggedIn} loginHref={loginHref} t={t} compact />
          </div>
        </li>
      ))}
    </ul>
  );
}
