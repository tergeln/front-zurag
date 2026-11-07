"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { secondaryButton } from "@/components/ui/styles";

/**
 * Watches the order status in the database (every 4 s) and reloads the page
 * once it changes. "I've paid" additionally asks the server to check with QPay.
 * This component never marks anything paid itself.
 */
export function PaymentStatus({ orderId, t }: { orderId: string; t: Dictionary["checkout"] }) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let stop = false;
    const tick = async () => {
      const res = await fetch(`/api/orders/${orderId}/status`, { cache: "no-store" }).catch(() => null);
      const status = res?.ok ? ((await res.json()) as { status: string }).status : "pending";
      if (status !== "pending") router.refresh();
      else if (!stop) setTimeout(tick, 4000);
    };
    const first = setTimeout(tick, 4000);
    return () => {
      stop = true;
      clearTimeout(first);
    };
  }, [orderId, router]);

  return (
    <div className="flex flex-col gap-3">
      <p role="status" className="flex items-center gap-2 text-zinc-700">
        <span className="size-2 animate-pulse rounded-full bg-amber-500" aria-hidden />
        {t.waiting}
      </p>
      <button
        type="button"
        disabled={checking}
        className={`${secondaryButton} w-fit`}
        onClick={async () => {
          setChecking(true);
          setMessage(null);
          const res = await fetch(`/api/orders/${orderId}/status?check=1`, { cache: "no-store" }).catch(() => null);
          const status = res?.ok ? ((await res.json()) as { status: string }).status : "pending";
          setChecking(false);
          if (status !== "pending") router.refresh();
          else setMessage(t.stillPending);
        }}
      >
        {checking ? t.checking : t.iPaid}
      </button>
      {message && <p className="text-sm text-zinc-600">{message}</p>}
    </div>
  );
}
