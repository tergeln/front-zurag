import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";

// Placeholder photography until real event galleries exist (Phase 4+).
const heroPhotos = [
  { seed: "zurag-graduation", w: 900, h: 1100, className: "row-span-2" },
  { seed: "zurag-marathon", w: 900, h: 640, className: "" },
  { seed: "zurag-concert", w: 900, h: 640, className: "" },
];

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).home;

  return (
    <>
      {/* Hero: text left, photo mosaic right */}
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-16 pt-12 md:grid-cols-[1.05fr_1fr] md:px-8 md:pb-24 md:pt-20">
        <div className="flex flex-col gap-7">
          <p className="text-sm font-medium text-[var(--color-accent)]">{t.eyebrow}</p>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tighter text-zinc-950 md:text-6xl">{t.title}</h1>
          <p className="max-w-[58ch] text-lg leading-relaxed text-zinc-600">{t.lead}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/${locale}/signup`}
              className="rounded-lg bg-zinc-900 px-5 py-3 text-[15px] font-medium text-white transition-[transform,background-color] duration-200 hover:bg-zinc-800 active:scale-[0.98]"
            >
              {t.ctaFind}
            </Link>
            <Link href="#how" className="rounded-lg px-4 py-3 text-[15px] font-medium text-zinc-800 underline-offset-4 transition-colors duration-200 hover:underline">
              {t.stepsTitle}
            </Link>
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-500">
            {t.tagline.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="grid h-[420px] grid-cols-2 grid-rows-2 gap-3 md:h-[560px]">
          {heroPhotos.map((p, i) => (
            <div key={p.seed} className={`relative overflow-hidden rounded-2xl bg-zinc-200 ${p.className}`}>
              <Image
                src={`https://picsum.photos/seed/${p.seed}/${p.w}/${p.h}`}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </section>

      {/* How it works: numbered editorial list */}
      <section id="how" className="border-t border-zinc-200/70 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 md:grid-cols-[1fr_2fr] md:px-8 md:py-24">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl">{t.stepsTitle}</h2>
          <ol className="divide-y divide-zinc-200">
            {t.steps.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[3rem_1fr] gap-4 py-6 first:pt-0">
                <span className="font-mono text-sm text-zinc-400">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-lg font-medium text-zinc-900">{step.title}</h3>
                  <p className="max-w-[60ch] leading-relaxed text-zinc-600">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Privacy + photographers */}
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-16 md:grid-cols-[2fr_3fr] md:px-8 md:py-24">
        <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-8 md:p-10">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950">{t.privacyTitle}</h2>
          <p className="leading-relaxed text-zinc-600">{t.privacyBody}</p>
        </div>

        <div id="photographers" className="relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-3xl bg-zinc-900 p-8 md:p-10">
          <Image
            src="https://picsum.photos/seed/zurag-photographer/1400/900"
            alt=""
            fill
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover opacity-45"
          />
          <div className="relative flex max-w-[52ch] flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{t.photographersTitle}</h2>
            <p className="leading-relaxed text-zinc-200">{t.photographersBody}</p>
            <Link
              href={`/${locale}/signup`}
              className="w-fit rounded-lg bg-white px-5 py-3 text-[15px] font-medium text-zinc-900 transition-[transform,background-color] duration-200 hover:bg-zinc-100 active:scale-[0.98]"
            >
              {t.photographersCta}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
