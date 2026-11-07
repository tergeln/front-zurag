"use client";

import { mn } from "@/i18n/dictionaries/mn";
import { en } from "@/i18n/dictionaries/en";
import { primaryButton } from "@/components/ui/styles";

// Shown when a page throws. No technical details reach the visitor.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-6 px-4 py-24 md:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">{mn.error.title}</h1>
        <p className="text-zinc-600">{mn.error.body}</p>
        <p className="text-sm text-zinc-500">{en.error.title}. {en.error.body}</p>
      </div>
      <button type="button" onClick={reset} className={`${primaryButton} w-fit`}>{mn.error.retry} / {en.error.retry}</button>
    </div>
  );
}
