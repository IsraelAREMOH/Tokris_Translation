import type { ContentCardData } from "@/components/content/content-card";
import type { BlogPostSummary } from "@/lib/blog/types";

/** Maps a blog post onto the generic card shape — any future content type
 * (Case Studies, News…) writes its own version of this, ContentCard itself
 * never changes. */
export function toContentCard(post: BlogPostSummary): ContentCardData {
  return {
    href: `/blog/${post.slug}`,
    coverImageUrl: post.cover_image?.url ?? null,
    coverImageAlt: post.cover_image_alt ?? post.title,
    categoryLabel: post.category?.name ?? null,
    categoryHref: post.category ? `/blog/category/${post.category.slug}` : null,
    title: post.title,
    excerpt: post.excerpt,
    authorName: post.author?.name ?? null,
    readingTimeMinutes: post.reading_time_minutes,
    publishedAt: post.published_at,
    viewCount: post.view_count,
  };
}
