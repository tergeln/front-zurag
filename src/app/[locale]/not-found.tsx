import Link from "next/link";
import { mn } from "@/i18n/dictionaries/mn";
import { en } from "@/i18n/dictionaries/en";
import { primaryButton, textLink } from "@/components/ui/styles";

// not-found.tsx gets no route params, so it shows both languages.
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-6 px-4 py-24 md:px-8">
      <p className="font-mono text-sm text-zinc-400">404</p>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">{mn.notFound.title}</h1>
        <p className="text-zinc-600">{mn.notFound.body}</p>
        <p className="text-sm text-zinc-500">{en.notFound.title}. {en.notFound.body}</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/mn/events" className={primaryButton}>{mn.notFound.events}</Link>
        <Link href="/" className={textLink}>{mn.notFound.home} / {en.notFound.home}</Link>
      </div>
    </div>
  );
}
