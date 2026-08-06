import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { BlogBrandBackdrop } from "@/components/blog/blog-brand-backdrop";
import { BlogEmptyState } from "@/components/blog/blog-empty-state";
import { BlogLandingSkeleton } from "@/components/blog/blog-landing-skeleton";
import { BlogSearchBar } from "@/components/blog/blog-search-bar";
import { BlogSectionDivider } from "@/components/blog/blog-section-divider";
import { BrowseByCategory } from "@/components/blog/browse-by-category";
import { BrowseByTag } from "@/components/blog/browse-by-tag";
import { FeaturedHero } from "@/components/blog/featured-hero";
import { NewsletterSignup } from "@/components/blog/newsletter-signup";
import { SearchSuggestions } from "@/components/blog/search-suggestions";
import { ContentCard } from "@/components/content/content-card";
import { JsonLd } from "@/components/content/json-ld";
import { Pagination } from "@/components/ui/pagination";
import { toContentCard } from "@/lib/blog/content-card-adapter";
import { getCategories } from "@/lib/blog/categories/queries";
import { BLOG_PAGE_SIZE, POPULAR_POSTS_LIMIT } from "@/lib/blog/posts/constants";
import { getFeaturedPost, getPopularPosts, getPublishedPosts } from "@/lib/blog/posts/queries";
import { buildWebsiteSchema } from "@/lib/blog/seo/structured-data";
import { getTags } from "@/lib/blog/tags/queries";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("blog.landing");
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: { canonical: "/blog" },
    robots: { index: true, follow: true },
  };
}

export default async function BlogLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("blog.landing");
  const { q, page } = resolvedSearchParams;

  return (
    <div className="relative isolate overflow-hidden">
      <BlogBrandBackdrop size="hero" />

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <JsonLd data={buildWebsiteSchema(locale)} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.22em] text-brand-600 uppercase dark:text-brand-400">
              {t("eyebrow")}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-base text-muted-foreground">{t("subtitle")}</p>
          </div>
          <BlogSearchBar placeholder={t("searchPlaceholder")} />
        </div>

        {/*
          A manually-placed Suspense boundary, scoped to this page's own tree —
          NOT a loading.tsx file. This page never calls notFound()/redirect(),
          so there's no risk here, but keeping the same pattern everywhere
          avoids anyone "helpfully" adding a loading.tsx back later.
        */}
        <Suspense key={`${q ?? ""}-${page ?? ""}`} fallback={<BlogLandingSkeleton />}>
          <BlogLandingContent q={q} page={page} />
        </Suspense>
      </div>
    </div>
  );
}

async function BlogLandingContent({ q, page: pageParam }: { q?: string; page?: string }) {
  const [t, tPagination] = await Promise.all([
    getTranslations("blog.landing"),
    getTranslations("blog.pagination"),
  ]);

  const page = Math.max(1, Number(pageParam) || 1);
  const isSearching = Boolean(q);

  const [{ posts, total, usedFuzzy, suggestions }, featured, popular, categories, tags] =
    await Promise.all([
      getPublishedPosts({ page, search: q }),
      isSearching ? Promise.resolve(null) : getFeaturedPost(),
      isSearching ? Promise.resolve([]) : getPopularPosts(POPULAR_POSTS_LIMIT),
      isSearching ? Promise.resolve([]) : getCategories(),
      isSearching ? Promise.resolve([]) : getTags(),
    ]);

  // The featured post already gets its own hero — don't show it twice.
  const latestPosts = featured ? posts.filter((post) => post.id !== featured.id) : posts;

  return (
    <>
      {featured ? (
        <div className="mt-12">
          <FeaturedHero post={featured} eyebrow={t("featuredEyebrow")} readMoreLabel={t("readMore")} />
        </div>
      ) : null}

      {popular.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-foreground">
            {t("popularTitle")}
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((post) => (
              <ContentCard key={post.id} data={toContentCard(post)} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-16">
        <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-foreground">
          {t("latestTitle")}
        </h2>

        {isSearching && usedFuzzy && latestPosts.length > 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{t("fuzzyNotice")}</p>
        ) : null}

        {latestPosts.length === 0 ? (
          <BlogEmptyState message={isSearching ? t("noResults") : t("empty")}>
            {suggestions ? (
              <SearchSuggestions suggestions={suggestions} label={t("suggestionsIntro")} />
            ) : null}
          </BlogEmptyState>
        ) : (
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <ContentCard key={post.id} data={toContentCard(post)} highlightTerm={q} />
            ))}
          </div>
        )}
        <div className="mt-10">
          <Pagination
            page={page}
            pageSize={BLOG_PAGE_SIZE}
            total={total}
            basePath="/blog"
            searchParams={{ q }}
            previousLabel={tPagination("previous")}
            nextLabel={tPagination("next")}
            pageLabel={(current, count) => tPagination("page", { current, total: count })}
          />
        </div>
      </section>

      {categories.length > 0 ? (
        <div className="mt-16">
          <BrowseByCategory categories={categories} title={t("categoriesTitle")} />
        </div>
      ) : null}

      {tags.length > 0 ? (
        <div className="mt-16">
          <BrowseByTag tags={tags} title={t("tagsTitle")} />
        </div>
      ) : null}

      <BlogSectionDivider />
      <NewsletterSection />
    </>
  );
}

async function NewsletterSection() {
  const t = await getTranslations("blog.newsletter");
  return (
    <NewsletterSignup
      source="blog-landing"
      title={t("title")}
      description={t("description")}
      emailLabel={t("emailLabel")}
      placeholder={t("placeholder")}
      submitLabel={t("submit")}
      successMessage={t("success")}
      followLabel={t("followLabel")}
    />
  );
}
