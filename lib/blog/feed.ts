import { getLatestPosts } from "@/lib/blog/posts/queries";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const FEED_POST_LIMIT = 20;

export type FeedEntry = {
  title: string;
  url: string;
  summary: string;
  contentHtml: string;
  publishedAt: string;
  updatedAt: string;
  categories: string[];
};

/** Shared by the RSS and Atom routes so both stay in sync from one fetch. */
export async function getFeedEntries(): Promise<FeedEntry[]> {
  const posts = await getLatestPosts(FEED_POST_LIMIT);

  return posts
    .filter((post) => post.published_at)
    .map((post) => ({
      title: post.title,
      url: `${SITE_URL}/en/blog/${post.slug}`,
      summary: post.excerpt ?? "",
      contentHtml: post.content_html,
      publishedAt: post.published_at as string,
      updatedAt: post.updated_at,
      categories: [post.category?.name, ...post.tags.map((tag) => tag.name)].filter(
        (value): value is string => !!value,
      ),
    }));
}

/** Escapes the handful of characters that are unsafe inside XML text nodes. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function getFeedSiteUrl() {
  return SITE_URL;
}
