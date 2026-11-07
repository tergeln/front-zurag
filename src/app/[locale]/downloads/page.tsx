import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatMnt } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { PageIntro } from "@/components/layout/page-intro";
import { primaryButton } from "@/components/ui/styles";
import { ZipDownload } from "./zip-download";

type Download = {
  photo_id: string;
  filename: string | null;
  width: number | null;
  height: number | null;
  bytes: number;
  event_slug: string;
  event_name_mn: string;
  event_name_en: string | null;
  order_no: string;
  granted_at: string;
};
type OrderRow = { id: string; order_no: string; total_mnt: number; status: string; paid_at: string | null; created_at: string; order_items: { count: number }[] };

function size(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default async function DownloadsPage({ params }: PageProps<"/[locale]/downloads">) {
  const locale = resolveLocale((await params).locale);
  await requireUser(locale, `/${locale}/downloads`);
  const dict = getDictionary(locale);
  const t = dict.downloads;

  const supabase = await createClient();
  const [{ data: dl }, { data: orders }] = await Promise.all([
    supabase.rpc("get_my_downloads"),
    supabase
      .from("orders")
      .select("id, order_no, total_mnt, status, paid_at, created_at, order_items(count)")
      .in("status", ["paid", "partially_refunded", "refunded"])
      .order("created_at", { ascending: false })
      .limit(50)
      .returns<OrderRow[]>(),
  ]);
  const downloads = (dl ?? []) as Download[];

  // Group by event, newest purchase first.
  const groups = new Map<string, { name: string; slug: string; items: Download[] }>();
  for (const d of downloads) {
    const name = locale === "en" && d.event_name_en ? d.event_name_en : d.event_name_mn;
    const g = groups.get(d.event_slug) ?? { name, slug: d.event_slug, items: [] };
    g.items.push(d);
    groups.set(d.event_slug, g);
  }

  return (
    <PageIntro title={t.title} lead={t.lead}>
      {downloads.length ? (
        <>
          <div className="flex flex-col gap-2">
            <ZipDownload photoIds={downloads.map((d) => d.photo_id)} label={t.downloadAll} t={t} primary />
            <p className="text-sm text-zinc-500">{t.linkNote}</p>
          </div>
          {[...groups.values()].map((g) => (
            <section key={g.slug} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold text-zinc-950">{g.name}</h2>
                {groups.size > 1 && <ZipDownload photoIds={g.items.map((d) => d.photo_id)} label={t.selected.replace("{n}", String(g.items.length))} t={t} />}
              </div>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {g.items.map((d) => (
                  <li key={d.photo_id} className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white">
                    <div className="aspect-[4/3] bg-zinc-100">
                      {/* eslint-disable-next-line @next/next/no-img-element -- signed, short-lived R2 URL via redirect */}
                      <img src={`/api/photos/${d.photo_id}/image?variant=thumb`} alt="" loading="lazy" className="size-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-2 p-3">
                      <span className="truncate text-[13px] text-zinc-600" title={d.filename ?? undefined}>{d.filename}</span>
                      <span className="text-[12px] text-zinc-400">
                        {[d.width && d.height ? `${d.width}×${d.height}` : null, size(Number(d.bytes))].filter(Boolean).join(" · ")}
                      </span>
                      {/* A plain link: the route checks the right and redirects to a 5-minute signed link. */}
                      <a href={`/api/downloads/${d.photo_id}`} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-center text-[13px] font-medium text-white hover:bg-zinc-800">
                        {t.download}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      ) : (
        <>
          <p className="text-zinc-600">{t.empty}</p>
          <Link href={`/${locale}/events`} className={`${primaryButton} w-fit`}>{t.browse}</Link>
        </>
      )}

      <section className="flex max-w-3xl flex-col gap-3 border-t border-zinc-200 pt-8">
        <h2 className="text-lg font-semibold text-zinc-950">{t.history}</h2>
        {orders?.length ? (
          <ul className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white text-sm">
            {orders.map((o) => (
              <li key={o.id} className="grid grid-cols-2 gap-2 px-5 py-3 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center sm:gap-6">
                <span className="font-mono text-zinc-900">{o.order_no}</span>
                <span className="text-zinc-500">{formatDate(o.paid_at ?? o.created_at, locale, true)}</span>
                <span className="text-zinc-600">{dict.admin.orders.statuses[o.status as keyof typeof dict.admin.orders.statuses]}</span>
                <span className="text-right font-mono text-zinc-950">{formatMnt(Number(o.total_mnt))}₮</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">{t.noHistory}</p>
        )}
      </section>
    </PageIntro>
  );
}
