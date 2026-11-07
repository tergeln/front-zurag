import Image from "next/image";
import type { ReactNode } from "react";

/** Split layout for login/signup: form on the left, a photo on the right (desktop only). */
export function AuthShell({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-12 px-4 py-12 md:grid-cols-[minmax(0,440px)_1fr] md:px-8 md:py-20">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">{title}</h1>
          <p className="max-w-[45ch] leading-relaxed text-zinc-600">{lead}</p>
        </div>
        {children}
      </div>
      <div className="relative hidden overflow-hidden rounded-3xl bg-zinc-200 md:block">
        <Image
          src="https://picsum.photos/seed/zurag-auth-crowd/1200/1400"
          alt=""
          fill
          sizes="(min-width: 768px) 50vw, 0px"
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
