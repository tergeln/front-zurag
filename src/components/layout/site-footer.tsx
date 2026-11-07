import type { Dictionary } from "@/i18n/dictionaries/mn";

export function SiteFooter({ t }: { t: Dictionary }) {
  return (
    <footer className="border-t border-zinc-200/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-10 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between md:px-8">
        <p>
          <span className="font-medium text-zinc-800">Zurag</span> · {t.home.tagline.join(" ")}
        </p>
        <p>© {new Date().getFullYear()} Zurag. {t.footer.rights}</p>
      </div>
    </footer>
  );
}
