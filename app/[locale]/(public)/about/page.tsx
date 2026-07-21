import {
  Award,
  Compass,
  Globe,
  HeartHandshake,
  Lightbulb,
  Lock,
  Rocket,
  ShieldCheck,
  Target,
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

import { CtaBand } from "@/components/public/cta-band";

export const metadata: Metadata = { title: "About Us" };

const STORY_IMAGE =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop";
const LIBRARY_IMAGE =
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1800&auto=format&fit=crop";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const values = [
    { icon: Award, title: t("v1Title"), body: t("v1Body") },
    { icon: ShieldCheck, title: t("v2Title"), body: t("v2Body") },
    { icon: Target, title: t("v3Title"), body: t("v3Body") },
    { icon: Lock, title: t("v4Title"), body: t("v4Body") },
    { icon: HeartHandshake, title: t("v5Title"), body: t("v5Body") },
    { icon: Lightbulb, title: t("v6Title"), body: t("v6Body") },
    { icon: Globe, title: t("v7Title"), body: t("v7Body") },
  ];

  const pillars = [
    { letter: "T", title: t("tokris.p1Title"), body: t("tokris.p1Body") },
    { letter: "O", title: t("tokris.p2Title"), body: t("tokris.p2Body") },
    { letter: "K", title: t("tokris.p3Title"), body: t("tokris.p3Body") },
    { letter: "R", title: t("tokris.p4Title"), body: t("tokris.p4Body") },
    { letter: "I", title: t("tokris.p5Title"), body: t("tokris.p5Body") },
  ];

  const stats = [
    { value: t("stat1Value"), label: t("stat1Label") },
    { value: t("stat2Value"), label: t("stat2Label") },
    { value: t("stat3Value"), label: t("stat3Label") },
    { value: t("stat4Value"), label: t("stat4Label") },
  ];

  return (
    <>
      {/* ---- Story: split hero ---- */}
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(48rem_30rem_at_85%_-15%,rgb(56_152_139/0.14),transparent_62%),radial-gradient(38rem_24rem_at_-10%_110%,rgb(208_145_62/0.1),transparent_62%)]"
        />
        <div aria-hidden className="bg-noise absolute inset-0 -z-10 opacity-[0.04]" />

        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="animate-rise text-xs font-semibold tracking-[0.22em] uppercase text-brand-600 dark:text-brand-400">
              {t("eyebrow")}
            </p>
            <h1 className="animate-rise mt-4 max-w-2xl font-display text-4xl font-semibold tracking-[-0.03em] text-foreground [animation-delay:100ms] sm:text-5xl">
              {t("title")}
            </h1>
            <p className="animate-rise mt-5 max-w-xl text-base text-muted-foreground [animation-delay:200ms]">
              {t("description")}
            </p>

            <h2 className="animate-rise mt-10 font-display text-2xl font-semibold tracking-[-0.02em] text-foreground [animation-delay:300ms]">
              {t("storyTitle")}
            </h2>
            <div className="animate-rise mt-4 flex max-w-xl flex-col gap-4 text-base text-muted-foreground [animation-delay:350ms]">
              <p>{t("storyP1")}</p>
              <p>{t("storyP2")}</p>
            </div>
          </div>

          <div className="animate-rise relative mx-auto w-full max-w-md [animation-delay:250ms] lg:justify-self-end">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-floating">
              <Image
                src={STORY_IMAGE}
                alt={t("imageAlt1")}
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
          </div>
        </div>
      </section>

      {/* ---- Vision / History split columns ---- */}
      <section className="border-y border-border/70 bg-surface/60">
        <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-surface/40 p-8 shadow-elevated backdrop-blur-md">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/10 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300">
              <Compass className="h-5 w-5" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-foreground">
              {t("visionTitle")}
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              {t("visionBody")}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-surface/40 p-8 shadow-elevated backdrop-blur-md">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-700 dark:text-accent-300">
              <Rocket className="h-5 w-5" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-foreground">
              {t("missionTitle")}
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              {t("missionBody")}
            </p>
          </div>
        </div>
      </section>

      {/* ---- TOKRIS framework: lettered pillars ---- */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6 sm:pt-24">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-14">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-brand-600 dark:text-brand-400">
              {t("tokris.eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              {t("tokris.title")}
            </h2>
          </div>
          <p className="text-base text-muted-foreground lg:pt-9">
            {t("tokris.subtitle")}
          </p>
        </div>

        <ol className="mt-12 border-t border-border/70">
          {pillars.map((pillar) => (
            <li
              key={pillar.letter}
              className="grid gap-x-8 gap-y-2 border-b border-border/70 py-7 sm:grid-cols-[3.5rem_minmax(0,16rem)_1fr] sm:items-start"
            >
              <span
                aria-hidden
                className="font-display text-4xl font-semibold tracking-[-0.02em] text-brand-600 dark:text-brand-400"
              >
                {pillar.letter}
              </span>
              <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-foreground sm:pt-1.5">
                {pillar.title}
              </h3>
              <p className="text-sm text-muted-foreground sm:pt-2">
                {pillar.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---- Wide library banner ---- */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6 sm:pt-24">
        <div className="relative aspect-[21/9] overflow-hidden rounded-3xl shadow-floating">
          <Image
            src={LIBRARY_IMAGE}
            alt={t("imageAlt2")}
            fill
            sizes="(min-width: 1152px) 72rem, 100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-brand-800/30 mix-blend-multiply"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
          />
          <dl className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-4 p-6 sm:grid-cols-4 sm:p-10">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <dt className="order-2 text-xs font-medium text-white/75">
                  {stat.label}
                </dt>
                <dd className="font-display text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---- Values grid ---- */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
            {t("valuesTitle")}
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            {t("valuesSubtitle")}
          </p>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <li
              key={value.title}
              className="group rounded-2xl border border-border/60 bg-surface/40 p-6 shadow-elevated backdrop-blur-md transition-transform duration-300 ease-spring hover:-translate-y-1"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/10 text-brand-700 transition-transform duration-300 ease-spring group-hover:scale-110 dark:bg-brand-400/10 dark:text-brand-300">
                <value.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
                {value.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{value.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <CtaBand />
    </>
  );
}
