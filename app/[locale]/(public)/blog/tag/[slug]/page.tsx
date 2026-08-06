import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArchiveResultsSkeleton } from "@/components/blog/archive-results-skeleton";
import { BlogBrandBackdrop } from "@/components/blog/blog-brand-backdrop";
import { BlogEmptyState } from "@/components/blog/blog-empty-state";
import { BlogSearchBar } from "@/components/blog/blog-search-bar";
import { SearchSuggestions } from "@/components/blog/search-suggestions";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { ContentCard } from "@/components/content/content-card";
import { JsonLd } from "@/components/content/json-ld";
import { Pagination } from "@/components/ui/pagination";
import { toContentCard } from "@/lib/blog/content-card-adapter";
import { BLOG_PAGE_SIZE } from "@/lib/blog/posts/constants";
import { getPublishedPosts } from "@/lib/blog/posts/queries";
import { buildBreadcrumbSchema } from "@/lib/blog/seo/structured-data";
import { getTagBySlug } from "@/lib/blog/tags/queries";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return {};
  return {
    title: `#${tag.name}`,
    alternates: { canonical: `/blog/tag/${tag.slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function BlogTagArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const [{ locale, slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const { q, page } = resolvedSearchParams;

  // Resolved before the Suspense boundary — see category/[slug]/page.tsx's
  // comment (same reasoning, same fix).
  const [tNav, tArchive, tag] = await Promise.all([
    getTranslations("nav"),
    getTranslations("blog.archive"),
    getTagBySlug(slug),
  ]);

  if (!tag) notFound();

  return (
    <div className="relative isolate overflow-hidden">
      <BlogBrandBackdrop size="compact" />

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <JsonLd
          data={buildBreadcrumbSchema([
            { name: tNav("blog"), path: "/blog" },
            { name: `#${tag.name}`, path: `/blog/tag/${tag.slug}` },
          ])}
        />

        <Breadcrumbs items={[{ label: tNav("blog"), href: "/blog" }, { label: `#${tag.name}` }]} />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
              {tArchive("tagTitle", { name: tag.name })}
            </h1>
          </div>
          <BlogSearchBar placeholder={tArchive("searchPlaceholder")} />
        </div>

        <Suspense key={`${q ?? ""}-${page ?? ""}`} fallback={<ArchiveResultsSkeleton />}>
          <TagArchiveResults slug={slug} q={q} page={page} />
        </Suspense>
      </div>
    </div>
  );
}

async function TagArchiveResults({
  slug,
  q,
  page: pageParam,
}: {
  slug: string;
  q?: string;
  page?: string;
}) {
  const [tArchive, tPagination] = await Promise.all([
    getTranslations("blog.archive"),
    getTranslations("blog.pagination"),
  ]);
  const page = Math.max(1, Number(pageParam) || 1);
  const { posts, total, suggestions } = await getPublishedPosts({ page, search: q, tagSlug: slug });

  return (
    <>
      {posts.length === 0 ? (
        <div className="mt-10">
          <BlogEmptyState message={q ? tArchive("noResults") : tArchive("empty")}>
            {suggestions ? (
              <SearchSuggestions suggestions={suggestions} label={tArchive("suggestionsIntro")} />
            ) : null}
          </BlogEmptyState>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <ContentCard key={post.id} data={toContentCard(post)} highlightTerm={q} />
          ))}
        </div>
      )}

      <div className="mt-10">
        <Pagination
          page={page}
          pageSize={BLOG_PAGE_SIZE}
          total={total}
          basePath={`/blog/tag/${slug}`}
          searchParams={{ q }}
          previousLabel={tPagination("previous")}
          nextLabel={tPagination("next")}
          pageLabel={(current, count) => tPagination("page", { current, total: count })}
        />
      </div>
    </>
  );
}
