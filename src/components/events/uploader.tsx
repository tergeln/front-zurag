"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { inputClass, labelClass, primaryButton } from "@/components/ui/styles";
import { ACCEPTED_TYPES, MAX_FILE_BYTES, PRESIGN_BATCH, isAcceptedType, matchesMagicBytes, parsePriceMnt } from "@/lib/uploads";

type Status = "queued" | "hashing" | "uploading" | "done" | "duplicate" | "invalid" | "error";
type Item = { id: number; file: File; status: Status; progress: number };

const CONCURRENCY = 4;

async function sha256Hex(file: File): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function isValidImage(file: File): Promise<boolean> {
  if (!isAcceptedType(file.type) || file.size < 1 || file.size > MAX_FILE_BYTES) return false;
  return matchesMagicBytes(file.type, new Uint8Array(await file.slice(0, 12).arrayBuffer()));
}

/** PUT with upload progress (fetch has no upload progress events). */
function putWithProgress(url: string, file: File, onProgress: (p: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`PUT ${xhr.status}`)));
    xhr.onerror = () => reject(new Error("network"));
    xhr.send(file);
  });
}

async function runPool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) await fn(items[next++]);
    }),
  );
}

export function Uploader({ eventId, defaultPrice, t }: { eventId: string; defaultPrice: number; t: Dictionary["events"]["upload"] }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [price, setPrice] = useState(String(defaultPrice));
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const patch = useCallback((ids: number[], change: Partial<Item>) => {
    const set = new Set(ids);
    setItems((prev) => prev.map((it) => (set.has(it.id) ? { ...it, ...change } : it)));
  }, []);

  // Warn before closing the tab while files are still uploading.
  useEffect(() => {
    if (!busy) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [busy]);

  const start = useCallback(
    async (files: File[]) => {
      const priceMnt = parsePriceMnt(price);
      if (priceMnt === null) {
        setError(t.invalidPrice);
        return;
      }
      setError(null);
      const batch: Item[] = files.map((file) => ({ id: nextId.current++, file, status: "queued", progress: 0 }));
      setItems((prev) => [...batch, ...prev]);
      setBusy(true);

      try {
        for (let i = 0; i < batch.length; i += PRESIGN_BATCH) {
          const chunk = batch.slice(i, i + PRESIGN_BATCH);

          // 1. Validate and hash in the browser.
          patch(chunk.map((c) => c.id), { status: "hashing" });
          const valid: { item: Item; sha256: string }[] = [];
          for (const item of chunk) {
            if (!(await isValidImage(item.file))) patch([item.id], { status: "invalid" });
            else valid.push({ item, sha256: await sha256Hex(item.file) });
          }
          if (!valid.length) continue;

          // 2. Ask the server for upload URLs (it also skips duplicates).
          const res = await fetch("/api/uploads/presign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventId,
              priceMnt,
              files: valid.map((v) => ({ name: v.item.file.name, size: v.item.file.size, type: v.item.file.type, sha256: v.sha256 })),
            }),
          });
          if (!res.ok) {
            patch(valid.map((v) => v.item.id), { status: "error" });
            setError(res.status === 403 ? t.forbidden : res.status === 429 ? t.rateLimited : t.failed);
            continue;
          }
          const { results } = (await res.json()) as { results: { index: number; duplicate?: true; photoId?: string; uploadUrl?: string }[] };

          // 3. Upload straight to storage, a few files at a time.
          const toUpload: { item: Item; photoId: string; url: string }[] = [];
          for (const r of results) {
            const item = valid[r.index].item;
            if (r.duplicate) patch([item.id], { status: "duplicate", progress: 1 });
            else toUpload.push({ item, photoId: r.photoId!, url: r.uploadUrl! });
          }
          const uploaded: string[] = [];
          await runPool(toUpload, CONCURRENCY, async ({ item, photoId, url }) => {
            patch([item.id], { status: "uploading" });
            try {
              await putWithProgress(url, item.file, (p) => patch([item.id], { progress: p }));
              uploaded.push(photoId);
            } catch {
              patch([item.id], { status: "error" });
            }
          });

          // 4. Tell the server which files arrived; it checks them in storage.
          if (uploaded.length) {
            const done = await fetch("/api/uploads/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ photoIds: uploaded }),
            });
            const { failed = uploaded } = done.ok ? ((await done.json()) as { failed: string[] }) : {};
            const failedSet = new Set(failed);
            for (const u of toUpload) {
              if (uploaded.includes(u.photoId)) patch([u.item.id], { status: failedSet.has(u.photoId) ? "error" : "done", progress: 1 });
            }
          }
        }
      } catch {
        setError(t.failed);
      } finally {
        setBusy(false);
        router.refresh();
      }
    },
    [eventId, patch, price, router, t],
  );

  const onFiles = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (files.length && !busy) void start(files);
  };

  const count = (s: Status) => items.filter((i) => i.status === s).length;
  const doneTotal = count("done") + count("duplicate") + count("invalid") + count("error");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:max-w-xs">
        <label htmlFor="upload-price" className={labelClass}>{t.price}</label>
        <input id="upload-price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} disabled={busy} className={`${inputClass} font-mono`} />
      </div>

      <div
        data-testid="dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-200 ${
          dragging ? "border-zinc-900 bg-zinc-100" : "border-zinc-300 bg-white"
        }`}
      >
        <p className="text-zinc-800">{t.drop}</p>
        <p className="text-sm text-zinc-500">{t.hint}</p>
        <input ref={inputRef} type="file" multiple accept={ACCEPTED_TYPES.join(",")} className="hidden" onChange={(e) => onFiles(e.target.files)} />
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className={primaryButton}>
          {t.choose}
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      {items.length > 0 && (
        <div className="flex flex-col gap-3">
          <div role="status" className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-600">
            <span className="font-medium text-zinc-900">{busy ? t.working.replace("{done}", String(doneTotal)).replace("{total}", String(items.length)) : t.finished}</span>
            <span>{t.counts.done}: <span className="font-mono">{count("done")}</span></span>
            <span>{t.counts.duplicate}: <span className="font-mono">{count("duplicate")}</span></span>
            <span>{t.counts.invalid}: <span className="font-mono">{count("invalid")}</span></span>
            <span>{t.counts.error}: <span className="font-mono">{count("error")}</span></span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
            <div className="h-full bg-zinc-900 transition-[width] duration-300" style={{ width: `${(doneTotal / items.length) * 100}%` }} />
          </div>
          <ul className="max-h-72 divide-y divide-zinc-100 overflow-y-auto rounded-xl border border-zinc-200 bg-white text-sm">
            {items.slice(0, 300).map((it) => (
              <li key={it.id} className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2">
                <span className="truncate text-zinc-800">{it.file.name}</span>
                <span className={it.status === "done" ? "text-emerald-700" : it.status === "error" || it.status === "invalid" ? "text-red-700" : "text-zinc-500"}>
                  {it.status === "uploading" ? `${Math.round(it.progress * 100)}%` : t.status[it.status]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
