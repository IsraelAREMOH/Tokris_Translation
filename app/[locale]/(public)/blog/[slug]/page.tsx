import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { PostView } from "@/components/blog/post-view";
import { PostViewTracker } from "@/components/blog/post-view-tracker";
import { JsonLd } from "@/components/content/json-ld";
import { redirect } from "@/i18n/navigation";
import {
  getAdjacentPosts,
  getCurrentSlugForRedirect,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/blog/posts/queries";
import { buildArticleSchema, buildBreadcrumbSchema } from "@/lib/blog/seo/structured-data";
import { SITE_URL } from "@/lib/site-url";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const title = post.seo_title || post.title;
  const description = post.meta_description || post.excerpt || undefined;
  const canonical = post.canonical_url || `${SITE_URL}/${locale}/blog/${post.slug}`;

  // Falls back to a dynamically generated, on-brand card so a share never
  // shows a blank image just because no cover/OG image was set.
  const fallbackOgImage = `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}${
    post.category ? `&category=${encodeURIComponent(post.category.name)}` : ""
  }`;
  const ogImageUrl = post.og_image?.url ?? post.cover_image?.url ?? fallbackOgImage;

  return {
    title,
    description,
    authors: post.author ? [{ name: post.author.name }] : undefined,
    alternates: {
      canonical,
      // Self-referencing hreflang — the site is English-only for V1 (see
      // i18n/routing.ts). Add a real per-locale entry here once another UI
      // locale exists and blog_posts.locale links genuine sibling
      // translations.
      languages: { en: `${SITE_URL}/en/blog/${post.slug}` },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: post.author ? [post.author.name] : undefined,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");

  const post = await getPostBySlug(slug);

  if (!post) {
    const currentSlug = await getCurrentSlugForRedirect(slug);
    if (currentSlug) redirect({ href: `/blog/${currentSlug}`, locale });
    notFound();
  }

  const articleUrl = `${SITE_URL}/${locale}/blog/${post.slug}`;

  const [relatedPosts, { previous, next }] = await Promise.all([
    getRelatedPosts(post.id, post.category_id),
    getAdjacentPosts(post.id, post.published_at),
  ]);

  const breadcrumbItems = [
    { name: tNav("blog"), path: "/blog" },
    ...(post.category
      ? [{ name: post.category.name, path: `/blog/category/${post.category.slug}` }]
      : []),
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <>
      <JsonLd data={buildArticleSchema(post, articleUrl)} />
      <JsonLd data={buildBreadcrumbSchema(breadcrumbItems)} />
      <PostViewTracker postId={post.id} />
      <PostView
        post={post}
        articleUrl={articleUrl}
        relatedPosts={relatedPosts}
        previous={previous ? { href: `/blog/${previous.slug}`, title: previous.title } : null}
        next={next ? { href: `/blog/${next.slug}`, title: next.title } : null}
      />
    </>
  );
}
