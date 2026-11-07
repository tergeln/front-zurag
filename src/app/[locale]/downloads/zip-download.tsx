"use client";

import { useState } from "react";
import { downloadZip } from "client-zip";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import { primaryButton, secondaryButton } from "@/components/ui/styles";

const MAX = 50;

/**
 * Builds the ZIP in the browser: the server only hands out 5-minute signed
 * links (for photos this user actually bought), and the originals stream
 * straight from storage into the ZIP. Duplicate file names get a suffix.
 */
export function ZipDownload({ photoIds, label, t, primary = false }: { photoIds: string[]; label: string; t: Dictionary["downloads"]; primary?: boolean }) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tooMany = photoIds.length > MAX;

  async function run() {
    setError(null);
    const res = await fetch("/api/downloads/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoIds: photoIds.slice(0, MAX) }),
    }).catch(() => null);
    if (!res?.ok) return setError(t.zipFailed);
    const { links } = (await res.json()) as { links: { filename: string; url: string }[] };
    if (!links.length) return setError(t.zipFailed);

    setProgress({ done: 0, total: links.length });
    const used = new Map<string, number>();
    const uniqueName = (name: string) => {
      const n = used.get(name) ?? 0;
      used.set(name, n + 1);
      return n ? name.replace(/(\.[^.]+)?$/, `-${n}$1`) : name;
    };
    try {
      async function* files() {
        for (const [i, l] of links.entries()) {
          const file = await fetch(l.url);
          if (!file.ok) throw new Error(`download ${file.status}`);
          yield { name: uniqueName(l.filename), input: file };
          setProgress({ done: i + 1, total: links.length });
        }
      }
      const blob = await downloadZip(files()).blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `zurag-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 60_000);
    } catch {
      setError(t.zipFailed);
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button type="button" disabled={!!progress || !photoIds.length || tooMany} onClick={run} className={`${primary ? primaryButton : secondaryButton} w-fit disabled:opacity-50`}>
        {progress ? t.zipping.replace("{done}", String(progress.done)).replace("{total}", String(progress.total)) : label}
      </button>
      {tooMany && <p className="text-sm text-zinc-500">{t.zipLimit}</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
