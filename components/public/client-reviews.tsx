import { getTranslations } from "next-intl/server";

const REVIEW_KEYS = ["q1", "q2", "q3"] as const;

/** Client reviews band shared by the home and contact pages. */
export async function ClientReviews() {
  const t = await getTranslations("testimonials");

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-brand-600 dark:text-brand-400">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
          {t("title")}
        </h2>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {REVIEW_KEYS.map((key) => (
          <figure
            key={key}
            className="flex flex-col justify-between rounded-2xl border border-border/60 bg-surface/40 p-7 shadow-elevated"
          >
            <blockquote>
              <span
                aria-hidden
                className="font-display text-5xl leading-none text-brand-600/25 dark:text-brand-400/25"
              >
                &ldquo;
              </span>
              <p className="mt-2 font-display text-lg font-medium leading-relaxed tracking-[-0.01em] text-foreground">
                {t(key)}
              </p>
            </blockquote>
            <figcaption className="mt-6 border-t border-border/60 pt-4 text-xs font-semibold tracking-[0.14em] uppercase text-muted-foreground">
              {t(`${key}Role`)}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
