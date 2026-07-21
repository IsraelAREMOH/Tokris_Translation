import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

/** High-impact closing CTA panel shared across the public pages. */
export async function CtaBand() {
  const t = await getTranslations("cta");

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="relative isolate overflow-hidden rounded-3xl bg-brand-800 px-6 py-14 text-center shadow-floating sm:px-12 sm:py-16 dark:bg-brand-900">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(36rem_20rem_at_80%_-20%,rgb(87_178_165/0.45),transparent_65%),radial-gradient(30rem_18rem_at_5%_120%,rgb(208_145_62/0.3),transparent_62%)]"
        />
        <div aria-hidden className="bg-noise absolute inset-0 -z-10 opacity-[0.07]" />

        <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-brand-100/90">
          {t("body")}
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/quote"
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-800 shadow-floating transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:translate-y-0 active:scale-[0.98]"
          >
            {t("button")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
