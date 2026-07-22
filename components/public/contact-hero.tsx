import { ArrowRight, MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

// Reuses the same six sector photos as the home page's industry gallery —
// already proxied through next/image's remotePatterns — cropped to portrait
// here so the strip reads as its own moment rather than a repeated section.
const MARQUEE_IMAGES = [
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
];

// Duplicated once so the -50% translateX loop in globals.css (`animate-marquee`)
// is seamless.
const TRACK_IMAGES = [...MARQUEE_IMAGES, ...MARQUEE_IMAGES];

export async function ContactHero({
  whatsappNumber,
}: {
  whatsappNumber: string;
}) {
  const t = await getTranslations("contact");
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : "https://wa.me/";

  return (
    <section className="relative isolate overflow-hidden pb-48 sm:pb-60">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="animate-ambient-a absolute -top-40 right-[-10%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(closest-side,rgb(56_152_139/0.28),transparent_70%)] blur-2xl" />
        <div className="animate-ambient-b absolute bottom-[-30%] left-[-12%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,rgb(208_145_62/0.2),transparent_70%)] blur-2xl" />
        <div className="bg-noise absolute inset-0 opacity-[0.05]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6 sm:pt-28">
        <p className="animate-rise flex items-center gap-3 text-xs font-semibold tracking-[0.22em] text-brand-700 uppercase dark:text-brand-300">
          <span
            aria-hidden
            className="h-px w-10 bg-brand-600/70 dark:bg-brand-400/60"
          />
          {t("eyebrow")}
        </p>
        <h1 className="animate-rise mt-6 max-w-2xl font-display text-4xl font-semibold tracking-[-0.03em] text-foreground [animation-delay:100ms] sm:text-5xl">
          {t("title")}
        </h1>
        <p className="animate-rise mt-5 max-w-xl text-base text-muted-foreground [animation-delay:200ms] sm:text-lg">
          {t("description")}
        </p>

        <div className="animate-rise mt-8 flex flex-wrap items-center gap-3 [animation-delay:300ms]">
          <a
            href="#contact-form"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
          >
            {t("heroCta")}
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-7 py-3 text-sm font-semibold text-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" />
            {t("whatsappCta")}
          </a>
        </div>
      </div>

      {/* Decorative photo strip, hidden from assistive tech; pauses for
          hover/focus and for prefers-reduced-motion (WCAG 2.2.2). Boxed to
          the same max-w-6xl container as the text above it, rather than
          bleeding edge-to-edge. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="relative h-44 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_85%,transparent)] sm:h-56">
            <div className="animate-marquee flex w-max gap-4 pt-8 hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
              {TRACK_IMAGES.map((src, index) => (
                <div
                  key={index}
                  className={`relative h-36 w-27 shrink-0 overflow-hidden rounded-2xl shadow-floating sm:h-48 sm:w-36 ${
                    index % 2 === 0 ? "-rotate-2" : "rotate-3"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="10rem"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-brand-800/30 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
