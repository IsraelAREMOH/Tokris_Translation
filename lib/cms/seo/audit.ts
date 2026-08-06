import type { SupabaseClient } from "@supabase/supabase-js";

import robots from "@/app/robots";
import { SITE_URL } from "@/lib/site-url";

export type SeoAuditPost = { id: string; title: string };

export type SeoAudit = {
  missingSeoTitle: SeoAuditPost[];
  missingMetaDescription: SeoAuditPost[];
  missingOgImage: SeoAuditPost[];
  duplicateTitles: { title: string; posts: SeoAuditPost[] }[];
  duplicateDescriptions: { description: string; posts: SeoAuditPost[] }[];
  sitemapUrls: string[];
  robotsRules: { userAgent: string; allow?: string | string[]; disallow?: string | string[] }[];
  postsAudited: number;
  /** Placeholder architecture only, per spec — no crawler exists yet. The
   * shape is here so a future implementation has somewhere to report into
   * without changing the SeoAudit type this page already renders. */
  brokenLinks: { implemented: false };
};

/**
 * Everything here is derived from blog_posts as it exists right now — no
 * fabricated scores. Scoped to non-archived posts (draft/scheduled/
 * published): an archived post's SEO fields don't matter, but a draft's
 * might, since the operator may be fixing them before publishing.
 */
export async function getSeoAudit(supabase: SupabaseClient): Promise<SeoAudit> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, seo_title, meta_description, og_image_id, cover_image_id, status")
    .neq("status", "archived");

  if (error) {
    console.error("SEO audit load failed:", error.message);
    return {
      missingSeoTitle: [],
      missingMetaDescription: [],
      missingOgImage: [],
      duplicateTitles: [],
      duplicateDescriptions: [],
      sitemapUrls: [],
      robotsRules: [],
      postsAudited: 0,
      brokenLinks: { implemented: false },
    };
  }

  const posts = (data ?? []) as {
    id: string;
    title: string;
    seo_title: string | null;
    meta_description: string | null;
    og_image_id: string | null;
    cover_image_id: string | null;
    status: string;
  }[];

  const missingSeoTitle = posts
    .filter((post) => !post.seo_title?.trim())
    .map((post) => ({ id: post.id, title: post.title }));

  const missingMetaDescription = posts
    .filter((post) => !post.meta_description?.trim())
    .map((post) => ({ id: post.id, title: post.title }));

  const missingOgImage = posts
    .filter((post) => !post.og_image_id && !post.cover_image_id)
    .map((post) => ({ id: post.id, title: post.title }));

  const byTitle = new Map<string, SeoAuditPost[]>();
  const byDescription = new Map<string, SeoAuditPost[]>();
  for (const post of posts) {
    const titleKey = post.title.trim().toLowerCase();
    if (titleKey) {
      byTitle.set(titleKey, [...(byTitle.get(titleKey) ?? []), { id: post.id, title: post.title }]);
    }
    const descriptionKey = post.meta_description?.trim().toLowerCase();
    if (descriptionKey) {
      byDescription.set(descriptionKey, [
        ...(byDescription.get(descriptionKey) ?? []),
        { id: post.id, title: post.title },
      ]);
    }
  }

  const duplicateTitles = [...byTitle.entries()]
    .filter(([, matches]) => matches.length > 1)
    .map(([, matchedPosts]) => ({ title: matchedPosts[0].title, posts: matchedPosts }));

  const duplicateDescriptions = [...byDescription.entries()]
    .filter(([, matches]) => matches.length > 1)
    .map(([description, matchedPosts]) => ({ description, posts: matchedPosts }));

  const robotsConfig = robots();

  return {
    missingSeoTitle,
    missingMetaDescription,
    missingOgImage,
    duplicateTitles,
    duplicateDescriptions,
    sitemapUrls: Array.isArray(robotsConfig.sitemap)
      ? robotsConfig.sitemap
      : robotsConfig.sitemap
        ? [robotsConfig.sitemap]
        : [`${SITE_URL}/sitemap/pages.xml`],
    robotsRules: (Array.isArray(robotsConfig.rules) ? robotsConfig.rules : [robotsConfig.rules]).map(
      (rule) => ({
        userAgent: Array.isArray(rule?.userAgent)
          ? rule.userAgent.join(", ")
          : (rule?.userAgent ?? "*"),
        allow: rule?.allow,
        disallow: rule?.disallow,
      }),
    ),
    postsAudited: posts.length,
    brokenLinks: { implemented: false },
  };
}
