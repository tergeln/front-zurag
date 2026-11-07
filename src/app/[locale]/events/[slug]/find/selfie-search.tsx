"use client";

import { useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/mn";
import type { PublicPhotoDetail } from "@/lib/public/queries";
import { PhotoGrid } from "@/components/gallery/photo-grid";
import { primaryButton, secondaryButton } from "@/components/ui/styles";

type Props = {
  locale: Locale;
  eventId: string;
  t: Dictionary["find"];
  gallery: Dictionary["gallery"];
  cartIds: string[];
  loginHref: string;
};

type State =
  | { kind: "idle" }
  | { kind: "searching"; preview: string }
  | { kind: "done"; preview: string; photos: (PublicPhotoDetail & { similarity: number })[] }
  | { kind: "error"; preview?: string; message: string };

export function SelfieSearch({ locale, eventId, t, gallery, cartIds, loginHref }: Props) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const input = useRef<HTMLInputElement>(null);

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-6 sm:flex-row sm:items-center">
        <div className="size-24 shrink-0 overflow-hidden rounded-full bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen selfie */}
          {preview && <img src={preview} alt="" className="size-full object-cover" />}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={input}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void search(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={state.kind === "searching"}
            onClick={() => input.current?.click()}
            className={`${state.kind === "done" ? secondaryButton : primaryButton} w-fit`}
          >
            {state.kind === "searching" ? t.searching : state.kind === "done" ? t.again : t.choose}
          </button>
          <p className="text-sm text-zinc-500">{t.hint}</p>
        </div>
      </div>

      {state.kind === "error" && <p role="alert" className="text-red-700">{state.message}</p>}

      {state.kind === "done" && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-zinc-950">{t.results.replace("{n}", String(state.photos.length))}</h2>
            <p className="text-sm text-zinc-600">{state.photos.length ? t.disclaimer : t.none}</p>
          </div>
          {state.photos.length > 0 && (
            <PhotoGrid locale={locale} t={gallery} photos={state.photos} cart={new Set(cartIds)} loggedIn loginHref={loginHref} />
          )}
        </section>
      )}
    </div>
  );
}
