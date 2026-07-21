import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Languages,
  Lock,
  MessageSquare,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

import { ClientReviews } from "@/components/public/client-reviews";
import { CtaBand } from "@/components/public/cta-band";
import { IndustryGallery } from "@/components/public/industry-gallery";
import { LanguageTerminal } from "@/components/public/language-terminal";
import { ServicesShowcase } from "@/components/public/services-showcase";
import { Link } from "@/i18n/navigation";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop";

// One image per service, in sv1–sv7 order.
const SERVICE_IMAGES = [
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop",
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const stats = [
    { value: t("statLanguagesValue"), label: t("statLanguages") },
    { value: t("statIndustriesValue"), label: t("statIndustries") },
    { value: t("statTurnaroundValue"), label: t("statTurnaround") },
    { value: t("statQualityValue"), label: t("statQuality") },
  ];

  const features = [
    { icon: BadgeCheck, title: t("features.f1Title"), body: t("features.f1Body") },
    { icon: Lock, title: t("features.f2Title"), body: t("features.f2Body") },
    { icon: MessageSquare, title: t("features.f3Title"), body: t("features.f3Body") },
    { icon: Clock, title: t("features.f4Title"), body: t("features.f4Body") },
  ];

  const steps = [
    { icon: Upload, title: t("process.s1Title"), body: t("process.s1Body") },
    { icon: MessageSquare, title: t("process.s2Title"), body: t("process.s2Body") },
    { icon: Languages, title: t("process.s3Title"), body: t("process.s3Body") },
    { icon: ShieldCheck, title: t("process.s4Title"), body: t("process.s4Body") },
  ];

  const services = [1, 2, 3, 4, 5, 6, 7].map((n, index) => ({
    title: t(`servicesSection.sv${n}Title`),
    body: t(`servicesSection.sv${n}Body`),
    alt: t(`servicesSection.sv${n}Alt`),
    image: SERVICE_IMAGES[index],
  }));

  return (
    <>
      {/* ---- Hero: split screen over the animated ambient matrix ---- */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="animate-ambient-a absolute -top-48 right-[-12%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(closest-side,rgb(56_152_139/0.3),transparent_70%)] blur-2xl" />
          <div className="animate-ambient-b absolute bottom-[-35%] left-[-14%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,rgb(208_145_62/0.22),transparent_70%)] blur-2xl" />
          <div className="bg-noise absolute inset-0 opacity-[0.05]" />
        </div>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col items-start">
            <p className="animate-rise flex items-center gap-3 text-xs font-semibold tracking-[0.22em] uppercase text-brand-700 dark:text-brand-300">
              <span
                aria-hidden
                className="h-px w-10 bg-brand-600/70 dark:bg-brand-400/60"
              />
              {t("eyebrow")}
            </p>
            <h1 className="animate-rise mt-6 max-w-2xl font-display text-5xl font-semibold tracking-[-0.03em] text-foreground [animation-delay:100ms] sm:text-6xl">
              {t("title")}
            </h1>
            <p className="animate-rise mt-6 max-w-xl text-lg text-muted-foreground [animation-delay:200ms]">
              {t("description")}
            </p>
            <div className="animate-rise mt-8 flex flex-wrap items-center gap-3 [animation-delay:300ms]">
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
              >
                {t("primaryCta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/services"
                className="rounded-full border border-border bg-surface px-7 py-3 text-sm font-semibold text-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
              >
                {t("secondaryCta")}
              </Link>
            </div>

            <div className="animate-rise mt-12 grid w-full max-w-xl grid-cols-2 gap-x-6 gap-y-8 [animation-delay:400ms] sm:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="border-l-2 border-brand-600/25 pl-4 dark:border-brand-400/25"
                >
                  <p className="font-display text-3xl font-semibold tracking-[-0.02em] text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-rise relative mx-auto w-full max-w-md [animation-delay:250ms] lg:justify-self-end">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-floating">
              <Image
                src={HERO_IMAGE}
                alt={t("heroImageAlt")}
                fill
                priority
                sizes="(min-width: 1024px) 28rem, 90vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-brand-700/25 mix-blend-multiply"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
              />
            </div>
            <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/75 px-4 py-3 shadow-floating backdrop-blur-md sm:-left-6">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-brand-600 dark:text-brand-400" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t("badgeTitle")}
                </p>
                <p className="text-xs text-muted-foreground">{t("badgeBody")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Services index: numbered editorial list ---- */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-brand-600 dark:text-brand-400">
              {t("servicesSection.eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              {t("servicesSection.title")}
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              {t("servicesSection.subtitle")}
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
          >
            {t("servicesSection.cta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12">
          <ServicesShowcase label={t("servicesSection.eyebrow")} items={services} />
        </div>
      </section>

      {/* ---- Features grid ---- */}
      <section className="border-y border-border/70 bg-surface/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-14">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-brand-600 dark:text-brand-400">
                {t("features.eyebrow")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
                {t("features.title")}
              </h2>
            </div>
            <p className="text-base text-muted-foreground lg:pt-9">
              {t("features.subtitle")}
            </p>
          </div>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <li
                key={feature.title}
                className="group rounded-2xl border border-border/60 bg-surface/40 p-6 shadow-elevated backdrop-blur-md transition-transform duration-300 ease-spring hover:-translate-y-1"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/10 text-brand-700 transition-transform duration-300 ease-spring group-hover:scale-110 dark:bg-brand-400/10 dark:text-brand-300">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- Process timeline ---- */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-brand-600 dark:text-brand-400">
            {t("process.eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
            {t("process.title")}
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            {t("process.subtitle")}
          </p>
        </div>

        <ol className="relative mt-14 grid gap-10 lg:grid-cols-4 lg:gap-6">
          <span
            aria-hidden
            className="absolute top-6 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-brand-600/10 via-brand-600/40 to-brand-600/10 lg:block dark:from-brand-400/10 dark:via-brand-400/40 dark:to-brand-400/10"
          />
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex flex-col items-start lg:items-center lg:text-center">
              <span className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-brand dark:bg-brand-500">
                <step.icon className="h-5 w-5" />
              </span>
              <p className="mt-5 text-xs font-semibold tracking-[0.18em] text-brand-600 uppercase dark:text-brand-400">
                {`0${index + 1}`}
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---- Industries: gallery hover carousel ---- */}
      <section className="border-t border-border/70 bg-surface/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-brand-600 dark:text-brand-400">
              {t("industriesSection.eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              {t("industriesSection.title")}
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              {t("industriesSection.subtitle")}
            </p>
          </div>

          <div className="mt-12">
            <IndustryGallery />
          </div>

          <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
            {t("industriesSection.more")}
          </p>
        </div>
      </section>

      {/* ---- Supported languages terminal ---- */}
      <section className="relative isolate overflow-hidden border-t border-border/70">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(44rem_26rem_at_50%_-10%,rgb(56_152_139/0.12),transparent_65%)]"
        />
        <div aria-hidden className="bg-noise absolute inset-0 -z-10 opacity-[0.03]" />
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-brand-600 dark:text-brand-400">
                {t("languagesSection.eyebrow")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
                {t("languagesSection.title")}
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                {t("languagesSection.subtitle")}
              </p>
            </div>
            <Link
              href="/services#languages"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
            >
              {t("languagesSection.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12">
            <LanguageTerminal />
          </div>
        </div>
      </section>

      <ClientReviews />

      <CtaBand />
    </>
  );
}
