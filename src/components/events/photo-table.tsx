import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { deletePhotos, setPhotoPrices } from "@/lib/events/actions";
import { PHOTO_PAGE_SIZE, type PhotoRow } from "@/lib/events/queries";
import { formatMnt } from "@/lib/money";
import { inputClass, secondaryButton, textLink } from "@/components/ui/styles";
import { SelectAll } from "./select-all";

function formatBytes(n: number) {
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

type Props = {
  locale: Locale;
  t: Dictionary["events"];
  rows: PhotoRow[];
  total: number;
  page: number;
  back: string; // current page path, without query
  showOwner: boolean;
};

export function PhotoTable({ locale, t, rows, total, page, back, showOwner }: Props) {
  const p = t.photos;
  if (!rows.length) return <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600">{p.empty}</p>;

  return (
    <form className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="back" value={page ? `${back}?page=${page}` : back} />

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="newPrice" className="text-sm text-zinc-600">{p.newPrice}</label>
          <input id="newPrice" name="newPrice" inputMode="numeric" className={`${inputClass} w-36 font-mono`} />
        </div>
        <button formAction={setPhotoPrices} className={secondaryButton}>{p.setPrice}</button>
        <button formAction={deletePhotos} className={`${secondaryButton} text-red-700`}>{p.delete}</button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="w-10 px-4 py-3"><SelectAll label={p.selectAll} /></th>
              <th className="px-4 py-3 font-medium">{p.file}</th>
              {showOwner && <th className="px-4 py-3 font-medium">{p.owner}</th>}
              <th className="px-4 py-3 font-medium">{p.size}</th>
              <th className="px-4 py-3 text-right font-medium">{p.price}</th>
              <th className="px-4 py-3 font-medium">{p.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2.5">
                  <input type="checkbox" name="photoIds" value={r.id} aria-label={r.original_filename ?? r.id} className="size-4 accent-zinc-900" />
                </td>
                <td className="max-w-xs px-4 py-2.5 text-zinc-800">
                  <div className="flex items-center gap-3">
                    {r.thumb_key ? (
                      <a href={`/api/photos/${r.id}/image?variant=preview`} target="_blank" rel="noopener" className="shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element -- signed, short-lived R2 URL via redirect */}
                        <img src={`/api/photos/${r.id}/image?variant=thumb`} alt="" loading="lazy" className="size-12 rounded-md bg-zinc-100 object-cover" />
                      </a>
                    ) : (
                      <span className="size-12 shrink-0 rounded-md bg-zinc-100" />
                    )}
                    <span className="truncate">{r.original_filename ?? r.id}</span>
                  </div>
                </td>
                {showOwner && (
                  <td className="px-4 py-2.5 text-zinc-600">{r.owner_type === "platform" ? t.company : (r.owner?.full_name ?? "—")}</td>
                )}
                <td className="whitespace-nowrap px-4 py-2.5 text-zinc-500">{formatBytes(Number(r.bytes))}</td>
                <td className="px-4 py-2.5 text-right font-mono text-zinc-900">{formatMnt(Number(r.price_mnt))}</td>
                <td className={`px-4 py-2.5 ${r.status === "failed" ? "text-red-700" : "text-zinc-600"}`}>{p.statuses[r.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 text-sm text-zinc-600">
        <span>{page * PHOTO_PAGE_SIZE + 1}-{page * PHOTO_PAGE_SIZE + rows.length} / {total}</span>
        {page > 0 && <Link href={`${back}?page=${page - 1}`} className={textLink}>{p.prev}</Link>}
        {(page + 1) * PHOTO_PAGE_SIZE < total && <Link href={`${back}?page=${page + 1}`} className={textLink}>{p.next}</Link>}
      </div>
      <p className="text-[13px] text-zinc-500">{p.processingNote}</p>
    </form>
  );
}
