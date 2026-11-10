import type { ReactNode } from "react";

export function PageIntro({ title, lead, children }: { title: string; lead?: string; children?: ReactNode }) {
  return (
    <div className="page-surface mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 md:px-8 md:py-16">
      <div className="page-heading flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl">{title}</h1>
        {lead && <p className="max-w-[60ch] leading-relaxed text-zinc-600">{lead}</p>}
      </div>
      {children}
    </div>
  );
}
