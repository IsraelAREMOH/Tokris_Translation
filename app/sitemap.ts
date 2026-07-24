import type { MetadataRoute } from "next";

import { getCategories } from "@/lib/blog/categories/queries";
import { getPublishedPosts } from "@/lib/blog/posts/queries";
import { getTags } from "@/lib/blog/tags/queries";
import { routing } from "@/i18n/routing";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Static, always-public routes — deliberately excludes /login, /register,
// /portal, /admin (and everything under them) and the /admin/preview route.
const STATIC_PATHS = ["", "/services", "/about", "/contact", "/quote", "/blog"];

function localizedEntries(path: string, lastModified?: Date) {
  return routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    lastModified,
  }));
}

/**
 * Split into four sitemaps (pages/posts/categories/tags) per the brief,
 * rather than one combined file — Next.js's generateSitemaps convention
 * auto-creates the /sitemap.xml index pointing at each of these.
 */
export async function generateSitemaps() {
  return [{ id: "pages" }, { id: "posts" }, { id: "categories" }, { id: "tags" }];
}

export default async function sitemap({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const sitemapId = await id;

  if (sitemapId === "pages") {
    return STATIC_PATHS.flatMap((path) => localizedEntries(path));
  }

  if (sitemapId === "posts") {
    // Only PUBLISHED content ever appears — getPublishedPosts already
    // filters via RLS to status='published' (+ due-scheduled).
    const entries: MetadataRoute.Sitemap = [];
    const pageSize = 200;
    let page = 1;
    // Walk all pages once at build/request time — a solo-operator blog
    // won't approach the 50k-URL sitemap ceiling for a long while.
    for (;;) {
      const { posts, total } = await getPublishedPosts({ page, pageSize });
      for (const post of posts) {
        entries.push(...localizedEntries(`/blog/${post.slug}`, new Date(post.updated_at)));
      }
      if (page * pageSize >= total || posts.length === 0) break;
      page += 1;
    }
    return entries;
  }

  if (sitemapId === "categories") {
    const categories = await getCategories();
    return categories.flatMap((category) => localizedEntries(`/blog/category/${category.slug}`));
  }

  if (sitemapId === "tags") {
    const tags = await getTags();
    return tags.flatMap((tag) => localizedEntries(`/blog/tag/${tag.slug}`));
  }

  return [];
}
