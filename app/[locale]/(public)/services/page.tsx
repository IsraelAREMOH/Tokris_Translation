import {
  ArrowRight,
  BadgeCheck,
  Ear,
  Globe,
  GraduationCap,
  Headphones,
  Languages,
  MessageCircle,
  MessagesSquare,
  Mic,
  Scale,
  Speaker,
  Video,
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

import { CtaBand } from "@/components/public/cta-band";
import { LanguagesCatalog } from "@/components/public/languages-catalog";
import { ServicesHeroAccordion } from "@/components/public/services-hero-accordion";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = { title: "Services" };

const TRANSLATION_IMAGE =
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200&auto=format&fit=crop";

// Hero accordion imagery — deliberately distinct from the card images below.
const HERO_PANELS = [
  {
    key: "translation",
    image:
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "certified",
    image:
      "https://images.unsplash.com/photo-1569974507005-6dc61f97fb5c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "interpretation",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "localization",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "training",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
  },
] as const;

const SERVICE_CARDS = [
  {
    key: "certified",
    icon: BadgeCheck,
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "sworn",
    icon: Scale,
    image:
      "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "interpretation",
    icon: Headphones,
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "localization",
    icon: Globe,
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "transcription",
    icon: Mic,
    image:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "training",
    icon: GraduationCap,
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop",
  },
] as const;

const INTERPRETATION_FORMATS = [
  { key: "fm1", icon: Headphones },
  { key: "fm2", icon: MessagesSquare },
  { key: "fm3", icon: Ear },
  { key: "fm4", icon: Video },
  { key: "fm5", icon: Speaker },
] as const;

const DOCUMENT_TYPE_KEYS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
] as const;

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");
  const tl = await getTranslations("languages");
  const tc = await getTranslations("cta");

  const heroPanels = HERO_PANELS.map((panel) => ({
    ...panel,
    title: t(`${panel.key}Title`),
  }));

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(48rem_30rem_at_85%_-15%,rgb(56_152_139/0.14),transparent_62%),radial-gradient(38rem_24rem_at_-8%_110%,rgb(208_145_62/0.1),transparent_62%)]"
        />
        <div aria-hidden className="bg-noise absolute inset-0 -z-10 opacity-[0.04]" />

        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-20 pb-6 sm:px-6 sm:pt-28 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
          <div>
            <p className="animate-rise text-xs font-semibold tracking-[0.22em] uppercase text-brand-600 dark:text-brand-400">
              {t("eyebrow")}
            </p>
            <h1 className="animate-rise mt-4 font-display text-4xl font-semibold tracking-[-0.03em] text-foreground [animation-delay:100ms] sm:text-5xl">
              {t("title")}
            </h1>
            <p className="animate-rise mt-5 max-w-xl text-base text-muted-foreground [animation-delay:200ms]">
              {t("description")}
            </p>
            <div className="animate-rise mt-8 [animation-delay:300ms]">
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
              >
                {tc("button")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="animate-rise min-w-0 [animation-delay:250ms]">
            <ServicesHeroAccordion panels={heroPanels} />
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          {/* Flagship translation card with the full document-type coverage */}
          <div className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface/40 shadow-elevated backdrop-blur-md lg:flex-row">
            <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:w-2/5">
              <Image
                src={TRANSLATION_IMAGE}
                alt={t("translationTitle")}
                fill
                sizes="(min-width: 1024px) 28rem, 100vw"
                className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-105"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-brand-700/25 mix-blend-multiply"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
              />
              <span className="absolute bottom-4 left-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white shadow-floating backdrop-blur-md">
                <Languages className="h-5 w-5" />
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6 sm:p-8">
              <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground">
                {t("translationTitle")}
              </h2>
              <p className="mt-2 text-base text-muted-foreground">
                {t("translationBody")}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {DOCUMENT_TYPE_KEYS.map((n) => (
                  <li
                    key={n}
                    className="rounded-full border border-border/60 bg-surface px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {t(`doc${n}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_CARDS.map((service) => (
              <li
                key={service.key}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface/40 shadow-elevated backdrop-blur-md transition-transform duration-300 ease-spring hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={t(`${service.key}Title`)}
                    fill
                    sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-brand-700/25 mix-blend-multiply"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
                  />
                  <span className="absolute bottom-4 left-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white shadow-floating backdrop-blur-md">
                    <service.icon className="h-5 w-5" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
                    {t(`${service.key}Title`)}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(`${service.key}Body`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- Interpretation formats ---- */}
      <section className="border-t border-border/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-14">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-brand-600 dark:text-brand-400">
                {t("formats.eyebrow")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
                {t("formats.title")}
              </h2>
            </div>
            <p className="text-base text-muted-foreground lg:pt-9">
              {t("formats.subtitle")}
            </p>
          </div>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INTERPRETATION_FORMATS.map((format) => (
              <li
                key={format.key}
                className="group rounded-2xl border border-border/60 bg-surface/40 p-6 shadow-elevated backdrop-blur-md transition-transform duration-300 ease-spring hover:-translate-y-1"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/10 text-brand-700 transition-transform duration-300 ease-spring group-hover:scale-110 dark:bg-brand-400/10 dark:text-brand-300">
                  <format.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
                  {t(`formats.${format.key}Title`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`formats.${format.key}Body`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- Languages catalogue ---- */}
      <section
        id="languages"
        className="scroll-mt-20 border-t border-border/70 bg-surface/60"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-brand-600 dark:text-brand-400">
              {tl("eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              {tl("title")}
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              {tl("description")}
            </p>
          </div>

          <div className="mt-8 flex max-w-2xl items-start gap-3 rounded-2xl border border-brand-600/20 bg-brand-50 px-5 py-4 dark:border-brand-400/20 dark:bg-brand-950">
            <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-700 dark:text-brand-300" />
            <p className="text-sm text-brand-800 dark:text-brand-200">
              {tl("pairsNote")}
            </p>
          </div>

          <div className="mt-12">
            <LanguagesCatalog />
          </div>
        </div>
      </section>

      <div className="pt-20 sm:pt-28">
        <CtaBand />
      </div>
    </>
  );
}
