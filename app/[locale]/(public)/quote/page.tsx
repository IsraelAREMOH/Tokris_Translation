import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

import { QuoteForm } from "@/components/quote/quote-form";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Request a Quote",
  alternates: { canonical: "/quote" },
};

// Reuses the services hero's "translation" panel photo — a subdued backdrop
// here rather than a sharp foreground image, since this page is single-column.
const BACKDROP_IMAGE =
  "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1600&auto=format&fit=crop";

export default async function QuotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("quote");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-20">
        <Image
          src={BACKDROP_IMAGE}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.16] dark:opacity-[0.12]"
        />
        <div className="absolute inset-0 bg-brand-800/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/85 to-background" />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="animate-ambient-a absolute -top-40 right-[-14%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,rgb(56_152_139/0.24),transparent_70%)] blur-2xl" />
        <div className="animate-ambient-b absolute bottom-[-30%] left-[-12%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,rgb(208_145_62/0.18),transparent_70%)] blur-2xl" />
        <div className="bg-noise absolute inset-0 opacity-[0.04]" />
      </div>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-20 sm:px-6 sm:py-24">
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-brand-600 dark:text-brand-400">
            Tokris Global Services
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-prose text-base text-muted-foreground">
            {t("description")}
          </p>
        </div>

        {user ? (
          <div className="rounded-2xl border border-border bg-floating p-6 shadow-floating sm:p-8">
            <QuoteForm />
          </div>
        ) : (
          <div className="flex flex-col items-start gap-5 rounded-2xl border border-border bg-floating p-8 shadow-floating">
            <p className="text-sm text-muted-foreground">{t("authPrompt")}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login?redirect=/quote"
                className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
              >
                {t("loginCta")}
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
              >
                {t("registerCta")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
