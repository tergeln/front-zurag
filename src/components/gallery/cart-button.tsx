"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { addToCart, removeFromCart } from "@/lib/public/actions";

type Labels = { addToCart: string; inCart: string; loginToBuy: string; errors: Record<"not_available" | "cart_full" | "generic", string> };

/** Toggles a photo in the cart. Visitors who are not logged in get a login link instead. */
export function CartButton({ photoId, initialInCart, loggedIn, loginHref, t, compact = false }: {
  photoId: string;
  initialInCart: boolean;
  loggedIn: boolean;
  loginHref: string;
  t: Labels;
  compact?: boolean;
}) {
  const [inCart, setInCart] = useState(initialInCart);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const size = compact ? "px-2.5 py-1.5 text-[13px]" : "px-4 py-2.5 text-[15px]";

  if (!loggedIn) {
    return (
      <Link href={loginHref} className={`inline-block rounded-lg border border-zinc-300 bg-white font-medium text-zinc-900 hover:bg-zinc-50 ${size}`}>
        {t.loginToBuy}
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={pending}
        aria-pressed={inCart}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = inCart ? await removeFromCart(photoId) : await addToCart(photoId);
            if (res.ok) setInCart(!inCart);
            else setError(res.error === "login" ? t.loginToBuy : t.errors[res.error]);
          })
        }
        className={`rounded-lg font-medium transition-[transform,background-color] duration-200 active:scale-[0.98] disabled:opacity-60 ${size} ${
          inCart ? "border border-emerald-300 bg-emerald-50 text-emerald-800" : "bg-zinc-900 text-white hover:bg-zinc-800"
        }`}
      >
        {inCart ? `✓ ${t.inCart}` : t.addToCart}
      </button>
      {error && <span role="alert" className="text-[13px] text-red-700">{error}</span>}
    </div>
  );
}
