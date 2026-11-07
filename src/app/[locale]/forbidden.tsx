import Link from "next/link";
import { mn } from "@/i18n/dictionaries/mn";
import { en } from "@/i18n/dictionaries/en";

// forbidden.tsx gets no route params, so it shows both languages.
export default function Forbidden() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-6 px-4 py-24 md:px-8">
      <p className="font-mono text-sm text-zinc-400">403</p>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">{mn.forbidden.title}</h1>
        <p className="text-zinc-600">{mn.forbidden.body}</p>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-medium text-zinc-700">{en.forbidden.title}</h2>
        <p className="text-zinc-500">{en.forbidden.body}</p>
      </div>
      <Link href="/" className="w-fit text-sm font-medium text-zinc-900 underline underline-offset-4 hover:text-[var(--color-accent)]">
        {mn.forbidden.home} / {en.forbidden.home}
      </Link>
    </div>
  );
}
