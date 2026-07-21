import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { QuoteForm } from "@/components/quote/quote-form";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Request a Quote" };

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
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(48rem_32rem_at_88%_-12%,rgb(56_152_139/0.13),transparent_62%),radial-gradient(40rem_28rem_at_-8%_112%,rgb(208_145_62/0.1),transparent_62%)]"
      />
      <div
        aria-hidden
        className="bg-noise absolute inset-0 -z-10 opacity-[0.04]"
      />
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
