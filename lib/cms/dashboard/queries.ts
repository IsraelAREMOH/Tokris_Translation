import type { SupabaseClient } from "@supabase/supabase-js";

export type ContentDashboardStats = {
  totalPages: number;
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  categories: number;
  tags: number;
  authors: number;
  newsletterSubscribers: number;
  mediaAssets: number;
  monthlyViews: number;
};

export type MostReadPost = {
  id: string;
  title: string;
  view_count: number;
} | null;

function startOfMonthIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function extractCount(
  result: { count: number | null; error: { message: string } | null },
  label: string,
): number {
  if (result.error) {
    console.error(`Dashboard count failed (${label}):`, result.error.message);
    return 0;
  }
  return result.count ?? 0;
}

/**
 * Every count is a `{count: 'exact', head: true}` query — cheap at this
 * app's expected scale (a solo operator's content volume), run in parallel.
 * Error-tolerant per table: a table that doesn't exist yet (migration not
 * run) contributes 0 rather than failing the whole dashboard.
 */
export async function getDashboardStats(supabase: SupabaseClient): Promise<ContentDashboardStats> {
  const [
    pagesResult,
    postsResult,
    publishedResult,
    draftResult,
    scheduledResult,
    categoriesResult,
    tagsResult,
    authorsResult,
    subscribersResult,
    mediaResult,
    monthlyViewsResult,
  ] = await Promise.all([
    supabase.from("pages").select("id", { count: "exact", head: true }),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }),
    supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "scheduled"),
    supabase.from("blog_categories").select("id", { count: "exact", head: true }),
    supabase.from("blog_tags").select("id", { count: "exact", head: true }),
    supabase.from("blog_authors").select("id", { count: "exact", head: true }),
    supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
    supabase.from("media_library").select("id", { count: "exact", head: true }),
    supabase
      .from("post_views")
      .select("id", { count: "exact", head: true })
      .gte("viewed_at", startOfMonthIso()),
  ]);

  const totalPages = extractCount(pagesResult, "pages");
  const totalPosts = extractCount(postsResult, "blog_posts");
  const publishedPosts = extractCount(publishedResult, "blog_posts:published");
  const draftPosts = extractCount(draftResult, "blog_posts:draft");
  const scheduledPosts = extractCount(scheduledResult, "blog_posts:scheduled");
  const categories = extractCount(categoriesResult, "blog_categories");
  const tags = extractCount(tagsResult, "blog_tags");
  const authors = extractCount(authorsResult, "blog_authors");
  const newsletterSubscribers = extractCount(subscribersResult, "newsletter_subscribers");
  const mediaAssets = extractCount(mediaResult, "media_library");
  const monthlyViews = extractCount(monthlyViewsResult, "post_views");

  return {
    totalPages,
    totalPosts,
    publishedPosts,
    draftPosts,
    scheduledPosts,
    categories,
    tags,
    authors,
    newsletterSubscribers,
    mediaAssets,
    monthlyViews,
  };
}

export async function getMostReadPost(supabase: SupabaseClient): Promise<MostReadPost> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, view_count")
    .gt("view_count", 0)
    .order("view_count", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Most-read post load failed:", error.message);
    return null;
  }
  return data ?? null;
}
