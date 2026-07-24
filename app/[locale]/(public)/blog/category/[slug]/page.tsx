import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArchiveResultsSkeleton } from "@/components/blog/archive-results-skeleton";
import { BlogSearchBar } from "@/components/blog/blog-search-bar";
import { SearchSuggestions } from "@/components/blog/search-suggestions";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { ContentCard } from "@/components/content/content-card";
import { JsonLd } from "@/components/content/json-ld";
import { Pagination } from "@/components/ui/pagination";
import { getCategoryBySlug } from "@/lib/blog/categories/queries";
import { toContentCard } from "@/lib/blog/content-card-adapter";
import { BLOG_PAGE_SIZE } from "@/lib/blog/posts/constants";
import { getPublishedPosts } from "@/lib/blog/posts/queries";
import { buildBreadcrumbSchema } from "@/lib/blog/seo/structured-data";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? undefined,
    alternates: { canonical: `/blog/category/${category.slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function BlogCategoryArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const [{ locale, slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const { q, page } = resolvedSearchParams;

  // Resolved BEFORE the Suspense boundary below, on purpose — see the memory
  // note on loading.tsx/notFound(): a not-found decision made inside a
  // suspended child can't retract an already-streamed 200. Here it's decided
  // in the page's own top-level await, before any JSX (let alone Suspense)
  // is returned, so it behaves like any ordinary synchronous notFound().
  const [tNav, tArchive, category] = await Promise.all([
    getTranslations("nav"),
    getTranslations("blog.archive"),
    getCategoryBySlug(slug),
  ]);

  if (!category) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: tNav("blog"), path: "/blog" },
          { name: category.name, path: `/blog/category/${category.slug}` },
        ])}
      />

      <Breadcrumbs items={[{ label: tNav("blog"), href: "/blog" }, { label: category.name }]} />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
            {tArchive("categoryTitle", { name: category.name })}
          </h1>
          {category.description ? (
            <p className="mt-4 text-base text-muted-foreground">{category.description}</p>
          ) : null}
        </div>
        <BlogSearchBar placeholder={tArchive("searchPlaceholder")} />
      </div>

      <Suspense key={`${q ?? ""}-${page ?? ""}`} fallback={<ArchiveResultsSkeleton />}>
        <CategoryArchiveResults slug={slug} q={q} page={page} />
      </Suspense>
    </div>
  );
}

async function CategoryArchiveResults({
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
  const { posts, total, suggestions } = await getPublishedPosts({
    page,
    search: q,
    categorySlug: slug,
  });

  return (
    <>
      {posts.length === 0 ? (
        <div className="mt-10 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {q ? tArchive("noResults") : tArchive("empty")}
          </p>
          {suggestions ? (
            <SearchSuggestions suggestions={suggestions} label={tArchive("suggestionsIntro")} />
          ) : null}
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
          basePath={`/blog/category/${slug}`}
          searchParams={{ q }}
          previousLabel={tPagination("previous")}
          nextLabel={tPagination("next")}
          pageLabel={(current, count) => tPagination("page", { current, total: count })}
        />
      </div>
    </>
  );
}
