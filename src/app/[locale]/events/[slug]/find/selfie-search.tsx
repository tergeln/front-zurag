"use client";

import { useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import type { MatchedPhoto } from "@/lib/public/queries";
import { PhotoGrid } from "@/components/gallery/photo-grid";
import { primaryButton, secondaryButton } from "@/components/ui/styles";

type Props = {
  locale: Locale;
  eventId: string;
  t: Dictionary["find"];
  gallery: Dictionary["gallery"];
  cartIds: string[];
  loggedIn: boolean;
  loginHref: string;
  initialPhotos: MatchedPhoto[]; // this browser's matches from the last 24 hours
};

type State =
  | { kind: "idle" }
  | { kind: "searching"; preview?: string }
  | { kind: "done"; preview?: string; photos: MatchedPhoto[] }
  | { kind: "error"; preview?: string; message: string };

export function SelfieSearch({ locale, eventId, t, gallery, cartIds, loggedIn, loginHref, initialPhotos }: Props) {
  const [state, setState] = useState<State>(initialPhotos.length ? { kind: "done", photos: initialPhotos } : { kind: "idle" });
  const [consent, setConsent] = useState(false);
  const [dragging, setDragging] = useState(false);
  const camera = useRef<HTMLInputElement>(null);
  const library = useRef<HTMLInputElement>(null);

  async function search(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setState({ kind: "error", message: t.errors.too_large });
      return;
    }
    // Shown only on this device, never uploaded anywhere except the search itself.
    const preview = URL.createObjectURL(file);
    setState({ kind: "searching", preview });
    const body = new FormData();
    body.append("eventId", eventId);
    body.append("image", file);
    body.append("consent", "on");
    try {
      const res = await fetch("/api/search", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) {
        const key = (json.error ?? "generic") as keyof typeof t.errors;
        setState({ kind: "error", preview, message: t.errors[key] ?? t.errors.generic });
        return;
      }
      setState({ kind: "done", preview, photos: json.photos });
    } catch {
      setState({ kind: "error", preview, message: t.errors.generic });
    }
  }

  const preview = state.kind === "idle" ? undefined : state.preview;
  const busy = state.kind === "searching";
  const disabled = busy || !consent;

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void search(f);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-w-2xl flex-col gap-3">
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-zinc-600">
          {t.consentPoints.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <label className="flex items-start gap-3 text-sm leading-relaxed text-zinc-800">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-4 accent-zinc-900" />
          <span>{t.consentCheck}</span>
        </label>
      </div>

      <div
        className={`flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-6 text-center transition-colors sm:p-8 ${dragging ? "border-zinc-900 bg-zinc-50" : "border-zinc-300 bg-white"}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (!f || busy) return;
          if (!consent) setState({ kind: "error", message: t.errors.no_consent });
          else void search(f);
        }}
      >
        <div className="size-24 shrink-0 overflow-hidden rounded-full bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen selfie */}
          {preview && <img src={preview} alt="" className="size-full object-cover" />}
        </div>
        {/* Camera: opens the front camera on phones. Library: picks an existing photo. */}
        <input ref={camera} type="file" accept="image/*" capture="user" className="hidden" onChange={pick} />
        <input ref={library} type="file" accept="image/*" className="hidden" onChange={pick} />
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" disabled={disabled} onClick={() => camera.current?.click()} className={primaryButton}>
            {busy ? t.searching : t.takeSelfie}
          </button>
          <button type="button" disabled={disabled} onClick={() => library.current?.click()} className={secondaryButton}>
            {t.fromLibrary}
          </button>
        </div>
        <p className="text-sm text-zinc-500">{t.dropHint}</p>
        <p className="text-sm text-zinc-500">{t.hint}</p>
        {!consent && <p className="text-sm font-medium text-zinc-700">{t.consentFirst}</p>}
      </div>

      {state.kind === "error" && <p role="alert" className="text-red-700">{state.message}</p>}

      {state.kind === "done" && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-zinc-950">{t.results.replace("{n}", String(state.photos.length))}</h2>
            <p className="text-sm text-zinc-600">{state.photos.length ? t.disclaimer : t.none}</p>
          </div>
          {state.photos.length > 0 && (
            <PhotoGrid locale={locale} t={gallery} photos={state.photos} cart={new Set(cartIds)} loggedIn={loggedIn} loginHref={loginHref} />
          )}
        </section>
      )}
    </div>
  );
}
