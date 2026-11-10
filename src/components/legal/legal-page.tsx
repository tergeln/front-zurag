import type { LegalDoc } from "@/i18n/legal";

export function LegalPage({ doc, vars = {} }: { doc: LegalDoc; vars?: Record<string, string> }) {
  const fill = (s: string) => s.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
  return (
    <article className="legal-surface mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 md:px-8 md:py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl">{doc.title}</h1>
        <p className="text-sm text-zinc-500">{doc.updated}</p>
        <p className="max-w-[65ch] leading-relaxed text-zinc-700">{doc.intro}</p>
      </header>
      {doc.sections.map((s) => (
        <section key={s.heading} className="flex flex-col gap-3 border-t border-zinc-200 pt-6">
          <h2 className="text-lg font-semibold text-zinc-950">{s.heading}</h2>
          <ul className="flex list-disc flex-col gap-2 pl-5 leading-relaxed text-zinc-700 marker:text-zinc-400">
            {s.body.map((p) => <li key={p}>{fill(p)}</li>)}
          </ul>
        </section>
      ))}
    </article>
  );
}
