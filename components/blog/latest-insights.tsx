import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { ContentCard } from "@/components/content/content-card";
import { Reveal } from "@/components/ui/reveal";
import { Link } from "@/i18n/navigation";
import { toContentCard } from "@/lib/blog/content-card-adapter";
import { LATEST_INSIGHTS_LIMIT } from "@/lib/blog/posts/constants";
import { getLatestPosts } from "@/lib/blog/posts/queries";

/** Homepage section — matches the spacing/eyebrow/title conventions of the
 * other home sections exactly (see app/[locale]/(public)/page.tsx). */
export async function LatestInsights() {
  const [t, posts] = await Promise.all([
    getTranslations("blog.homepage"),
    getLatestPosts(LATEST_INSIGHTS_LIMIT),
  ]);

  if (posts.length === 0) return null;

  return (
    <section className="border-t border-border/70 bg-surface/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.22em] text-brand-600 uppercase dark:text-brand-400">
              {t("eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-base text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Link
            href="/blog"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
          >
            {t("viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <Reveal delay={150} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <ContentCard key={post.id} data={toContentCard(post)} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
