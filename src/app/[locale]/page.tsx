import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve";
import { ScrollReveal } from "@/components/layout/scroll-reveal";
import { DesignIcon } from "@/components/ui/design-icon";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).home;
  const mn = locale === "mn";

  return (
    <ScrollReveal>
      <section className="make-hero">
        <div className="make-hero-glow" aria-hidden="true" />
        <div className="make-shell make-hero-grid">
          <div className="make-hero-copy">
            <p className="make-badge"><span><DesignIcon name="sparkle" size={15} /></span>{t.eyebrow}</p>
            <h1>{t.title}</h1>
            <p className="make-lead">{t.lead}</p>
            <div className="make-hero-actions">
              <Link href={`/${locale}/events`} className="make-button button-gradient">{t.ctaFind}<DesignIcon name="arrow" /></Link>
              <Link href="#how" className="make-explainer">{t.stepsTitle}<DesignIcon name="arrow" size={16} /></Link>
            </div>
            <ul className="make-trust-list">{t.tagline.map((line) => <li key={line}><DesignIcon name="check" size={14} />{line}</li>)}</ul>
          </div>
          <div className="make-hero-visual">
            <div className="make-hero-photo">
              <Image src="/images/figma-friends.jpg" alt={mn ? "Арга хэмжээний үеэр хамтдаа зургаа авахуулж буй найзууд" : "Friends posing together at an event"} fill priority quality={82} sizes="(min-width: 1240px) 540px, (min-width: 900px) 45vw, 90vw" className="object-cover" />
              <div className="make-photo-shade" />
              <div className="make-face-frame make-face-one" aria-hidden="true" />
              <div className="make-face-frame make-face-two" aria-hidden="true" />
              <Link href={`/${locale}/events`} className="make-photo-caption">
                <span className="make-camera"><DesignIcon name="camera" size={22} /></span>
                <span>{t.ctaFind}</span><span className="make-caption-arrow"><DesignIcon name="arrow" size={18} /></span>
              </Link>
            </div>
            <span className="make-floating-note"><DesignIcon name="sparkle" size={18} />{t.tagline[0]}</span>
          </div>
        </div>
      </section>

      <section id="how" className="make-how make-shell">
        <h2 data-reveal className="make-section-title">{t.stepsTitle}</h2>
        <ol className="make-steps">
          {t.steps.map((step, i) => (
            <li data-reveal key={step.title} className={`make-step ${i === 1 ? "make-step-featured" : ""}`}>
              <span className="make-step-number">{String(i + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3><p>{step.body}</p>
              <span className="make-step-icon"><DesignIcon name={i === 0 ? "search" : i === 1 ? "camera" : i === 2 ? "check" : "arrow"} size={21} /></span>
            </li>
          ))}
        </ol>
      </section>

      <section id="privacy" className="make-shell make-privacy-wrap">
        <div data-reveal className="make-privacy">
          <div className="make-privacy-copy">
            <span className="make-lock"><DesignIcon name="lock" size={24} /></span>
            <h2 className="make-section-title">{t.privacyTitle}</h2>
            <p>{t.privacyBody}</p>
          </div>
          <div className="make-privacy-photo">
            <Image src="/images/figma-celebration.jpg" alt={mn ? "Үдэшлэг дээр хундага тулгаж буй хүмүүс" : "People celebrating together"} fill quality={82} sizes="(min-width: 1240px) 590px, (min-width: 900px) 48vw, 90vw" className="object-cover" />
            <div className="make-privacy-overlay"><span><DesignIcon name="lock" size={36} /></span></div>
          </div>
        </div>
      </section>

      <section id="photographers" className="make-photographers">
        <div className="make-shell make-photographer-grid">
          <div data-reveal className="make-photographer-photo">
            <Image src="/images/figma-gathering.jpg" alt={mn ? "Гадаа ширээ тойрон сууж буй найзууд" : "Friends gathering around a table outdoors"} fill quality={82} sizes="(min-width: 1240px) 470px, (min-width: 900px) 40vw, 90vw" className="object-cover" />
          </div>
          <div data-reveal className="make-photographer-copy">
            <span className="make-photographer-symbol" aria-hidden="true"><DesignIcon name="camera" size={28} /></span>
            <h2 className="make-section-title">{t.photographersTitle}</h2><p>{t.photographersBody}</p>
            <Link href={`/${locale}/photographer/apply`} className="make-button make-button-gold">{t.photographersCta}<DesignIcon name="arrow" /></Link>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
