import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import {
  ADMIN_POSTS_PAGE_SIZE,
  BLOG_PAGE_SIZE,
  LATEST_INSIGHTS_LIMIT,
  POPULAR_POSTS_LIMIT,
  RELATED_POSTS_LIMIT,
} from "@/lib/blog/posts/constants";
import type {
  BlogAuthor,
  BlogCategory,
  BlogPost,
  BlogPostStatus,
  BlogPostSummary,
  BlogTag,
} from "@/lib/blog/types";
import { getMediaPublicUrl } from "@/lib/media/constants";
import type { MediaAsset } from "@/lib/media/types";
import { createPublicClient } from "@/lib/supabase/public-server";

// Reused for every media relation embedded below (cover image, OG image,
// author photo) — media_library is public-read (0006), so these joins work
// for anonymous visitors too.
const MEDIA_FIELDS =
  "id, file_name, storage_path, file_type, mime_type, size_bytes, width, height, alt_text, folder, uploaded_by, created_at";

// Excludes content_json (the Tiptap doc) — list/card views only ever render
// content_html, and the doc can be large. blog_posts has two FKs into
// media_library (cover_image_id, og_image_id), so each embed must be
// disambiguated with its constraint name (PostgREST requirement).
const SUMMARY_SELECT = `
  id, slug, locale, title, excerpt, content_html, reading_time_minutes,
  cover_image_id, cover_image_alt, category_id, author_id, status,
  featured, featured_order, pinned, pinned_at, published_at, scheduled_at,
  seo_title, meta_description, canonical_url, og_image_id, allow_comments,
  view_count, created_by, created_at, updated_at,
  category:blog_categories(id, name, slug, description, sort_order),
  author:blog_authors(id, profile_id, name, photo_id, bio, position, email, social_links, featured, photo:media_library(${MEDIA_FIELDS})),
  tags:blog_post_tags(tag:blog_tags(id, name, slug)),
  cover_image:media_library!blog_posts_cover_image_id_fkey(${MEDIA_FIELDS}),
  og_image:media_library!blog_posts_og_image_id_fkey(${MEDIA_FIELDS})
`;

const DETAIL_SELECT = `${SUMMARY_SELECT}, content_json, content_text`;

type RawMedia = Omit<MediaAsset, "url"> | null;
type RawTagJoin = { tag: BlogPostSummary["tags"][number] | null };
type RawAuthor =
  | (Omit<BlogAuthor, "photo"> & { photo: RawMedia })
  | null;

type RawPostRow = Omit<
  BlogPostSummary,
  "tags" | "author" | "cover_image" | "og_image"
> & {
  tags: RawTagJoin[] | null;
  author: RawAuthor;
  cover_image: RawMedia;
  og_image: RawMedia;
};
type RawPostDetailRow = Omit<BlogPost, keyof RawPostRow | "id"> & RawPostRow;

function mapMedia(row: RawMedia): MediaAsset | null {
  if (!row) return null;
  return { ...row, url: getMediaPublicUrl(row.storage_path) };
}

function mapAuthor(row: RawAuthor): BlogAuthor | null {
  if (!row) return null;
  return { ...row, photo: mapMedia(row.photo) };
}

function mapPost<T extends RawPostRow>(row: T) {
  const { tags, author, cover_image, og_image, ...rest } = row;
  return {
    ...rest,
    author: mapAuthor(author),
    cover_image: mapMedia(cover_image),
    og_image: mapMedia(og_image),
    tags: (tags ?? []).map((entry) => entry.tag).filter((tag) => tag !== null),
  };
}

export type SearchSuggestions = { categories: BlogCategory[]; tags: BlogTag[] };

export type PublishedPostsResult = {
  posts: BlogPostSummary[];
  total: number;
  /** Set when the primary ranked search found nothing and a trigram
   * similarity fallback was used instead — lets the UI say "showing results
   * for a similar term" rather than pretending it was an exact match. */
  usedFuzzy?: boolean;
  /** Populated only when a search returned zero results — a few categories/
   * tags to offer as "browse instead" suggestions. */
  suggestions?: SearchSuggestions;
};

async function hydrateAndOrder(
  supabase: ReturnType<typeof createPublicClient>,
  orderedIds: string[],
): Promise<BlogPostSummary[]> {
  if (orderedIds.length === 0) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select(SUMMARY_SELECT)
    .in("id", orderedIds);

  if (error) {
    console.error("Search result hydration failed:", error.message);
    return [];
  }

  // .in() doesn't preserve the requested order, so re-sort to match the
  // ranked id list the search RPC returned.
  const byId = new Map(
    (data ?? []).map((row) => [(row as unknown as RawPostRow).id, row as unknown as RawPostRow]),
  );
  return orderedIds
    .map((id) => byId.get(id))
    .filter((row): row is RawPostRow => !!row)
    .map((row) => mapPost(row));
}

async function getSearchSuggestions(
  supabase: ReturnType<typeof createPublicClient>,
): Promise<SearchSuggestions> {
  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase
      .from("blog_categories")
      .select("id, name, slug, description, sort_order")
      .order("sort_order", { ascending: true })
      .limit(5),
    supabase.from("blog_tags").select("id, name, slug").order("name", { ascending: true }).limit(8),
  ]);
  return { categories: categories ?? [], tags: tags ?? [] };
}

/** Site-wide ranked search (no category/tag scoping) — uses the
 * search_blog_posts()/search_blog_posts_fuzzy() RPCs from migration 0009. */
async function searchPublishedPosts(
  supabase: ReturnType<typeof createPublicClient>,
  search: string,
  page: number,
  pageSize: number,
): Promise<PublishedPostsResult> {
  const from = (page - 1) * pageSize;

  const { data: ranked, error } = await supabase.rpc("search_blog_posts", {
    p_query: search,
    p_limit: pageSize,
    p_offset: from,
  });

  if (error) {
    console.error("Ranked search failed:", error.message);
    return { posts: [], total: 0 };
  }

  const rankedRows = (ranked ?? []) as { id: string; rank: number; total_count: number }[];

  if (rankedRows.length > 0) {
    const posts = await hydrateAndOrder(supabase, rankedRows.map((row) => row.id));
    return { posts, total: rankedRows[0]?.total_count ?? posts.length };
  }

  // No direct/broadened matches — try a typo-tolerant fallback before
  // giving up and offering browse suggestions.
  const { data: fuzzy, error: fuzzyError } = await supabase.rpc("search_blog_posts_fuzzy", {
    p_query: search,
    p_limit: pageSize,
  });

  if (!fuzzyError && fuzzy && fuzzy.length > 0) {
    const fuzzyRows = fuzzy as { id: string; similarity_score: number }[];
    const posts = await hydrateAndOrder(supabase, fuzzyRows.map((row) => row.id));
    return { posts, total: posts.length, usedFuzzy: true };
  }

  const suggestions = await getSearchSuggestions(supabase);
  return { posts: [], total: 0, suggestions };
}

/**
 * Published (+ due-scheduled) posts for the blog landing page/archives.
 * Error-tolerant: if the blog_* tables don't exist yet (migrations not run),
 * this returns an empty page rather than throwing, matching getSiteContent().
 */
export const getPublishedPosts = cache(
  async ({
    page = 1,
    pageSize = BLOG_PAGE_SIZE,
    categorySlug,
    tagSlug,
    search,
  }: {
    page?: number;
    pageSize?: number;
    categorySlug?: string;
    tagSlug?: string;
    search?: string;
  } = {}): Promise<PublishedPostsResult> => {
    const supabase = createPublicClient();

    // Ranked, typo-tolerant search only applies site-wide (no category/tag
    // scoping) — within an archive, a plain filtered text match is enough
    // and keeps the archive's own category/tag constraint simple.
    if (search && !categorySlug && !tagSlug) {
      return searchPublishedPosts(supabase, search, page, pageSize);
    }

    let postIdFilter: string[] | null = null;
    if (tagSlug) {
      const { data: tagRows } = await supabase
        .from("blog_post_tags")
        .select("post_id, tag:blog_tags!inner(slug)")
        .eq("tag.slug", tagSlug);
      postIdFilter = (tagRows ?? []).map((row) => row.post_id as string);
      if (postIdFilter.length === 0) return { posts: [], total: 0 };
    }

    let query = supabase
      .from("blog_posts")
      .select(
        categorySlug
          ? SUMMARY_SELECT.replace(
              "category:blog_categories(",
              "category:blog_categories!inner(",
            )
          : SUMMARY_SELECT,
        { count: "exact" },
      )
      .order("pinned", { ascending: false })
      .order("published_at", { ascending: false });

    if (categorySlug) query = query.eq("category.slug", categorySlug);
    if (postIdFilter) query = query.in("id", postIdFilter);
    if (search) {
      query = query.textSearch("search_vector", search, {
        type: "websearch",
        config: "english",
      });
    }

    const from = (page - 1) * pageSize;
    const { data, error, count } = await query.range(from, from + pageSize - 1);

    if (error) {
      console.error("Blog posts load failed:", error.message);
      return { posts: [], total: 0 };
    }

    const posts = (data ?? []).map((row) => mapPost(row as unknown as RawPostRow));

    if (posts.length === 0 && search) {
      const suggestions = await getSearchSuggestions(supabase);
      return { posts, total: count ?? 0, suggestions };
    }

    return { posts, total: count ?? 0 };
  },
);

export const getPostBySlug = cache(
  async (slug: string): Promise<BlogPost | null> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(DETAIL_SELECT)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Blog post load failed:", error.message);
      return null;
    }
    if (!data) return null;

    return mapPost(data as unknown as RawPostDetailRow);
  },
);

/**
 * Resolves a stale slug (post was renamed) to its current one, so the public
 * detail page can 301 instead of 404ing. See blog_post_slug_redirects (0005).
 */
export const getCurrentSlugForRedirect = cache(
  async (oldSlug: string): Promise<string | null> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("blog_post_slug_redirects")
      .select("post:blog_posts(slug)")
      .eq("old_slug", oldSlug)
      .maybeSingle();

    if (error || !data) return null;
    const post = data.post as unknown as { slug: string } | null;
    return post?.slug ?? null;
  },
);

export const getFeaturedPost = cache(
  async (): Promise<BlogPostSummary | null> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(SUMMARY_SELECT)
      .eq("featured", true)
      .order("featured_order", { ascending: true })
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Featured post load failed:", error.message);
      return null;
    }
    if (data) return mapPost(data as unknown as RawPostRow);

    // No post is explicitly featured — fall back to the most recent.
    const { data: latest } = await supabase
      .from("blog_posts")
      .select(SUMMARY_SELECT)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return latest ? mapPost(latest as unknown as RawPostRow) : null;
  },
);

export const getLatestPosts = cache(
  async (limit = LATEST_INSIGHTS_LIMIT): Promise<BlogPostSummary[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(SUMMARY_SELECT)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Latest posts load failed:", error.message);
      return [];
    }
    return (data ?? []).map((row) => mapPost(row as unknown as RawPostRow));
  },
);

export const getPopularPosts = cache(
  async (limit = POPULAR_POSTS_LIMIT): Promise<BlogPostSummary[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(SUMMARY_SELECT)
      .order("view_count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Popular posts load failed:", error.message);
      return [];
    }
    return (data ?? []).map((row) => mapPost(row as unknown as RawPostRow));
  },
);

export type AdminPostSortField = "published_at" | "updated_at" | "title" | "view_count";

/**
 * Admin list/management view — takes the already-authenticated client from
 * requireAdmin() rather than creating its own (mirrors listMedia() in
 * lib/media/queries.ts), since RLS gates by role, not by which client
 * instance makes the call.
 */
export async function getAdminPosts(
  supabase: SupabaseClient,
  {
    search,
    status,
    categoryId,
    authorId,
    tagId,
    sortBy = "updated_at",
    sortDir = "desc",
    page = 1,
    pageSize = ADMIN_POSTS_PAGE_SIZE,
  }: {
    search?: string;
    status?: BlogPostStatus;
    categoryId?: string;
    authorId?: string;
    tagId?: string;
    sortBy?: AdminPostSortField;
    sortDir?: "asc" | "desc";
    page?: number;
    pageSize?: number;
  } = {},
): Promise<{ posts: BlogPostSummary[]; total: number }> {
  let postIdFilter: string[] | null = null;
  if (tagId) {
    const { data: tagRows } = await supabase
      .from("blog_post_tags")
      .select("post_id")
      .eq("tag_id", tagId);
    postIdFilter = (tagRows ?? []).map((row) => row.post_id as string);
    if (postIdFilter.length === 0) return { posts: [], total: 0 };
  }

  let query = supabase
    .from("blog_posts")
    .select(SUMMARY_SELECT, { count: "exact" })
    .order("pinned", { ascending: false })
    .order(sortBy, { ascending: sortDir === "asc" });

  if (status) query = query.eq("status", status);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (authorId) query = query.eq("author_id", authorId);
  if (postIdFilter) query = query.in("id", postIdFilter);
  if (search) query = query.ilike("title", `%${search}%`);

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);

  if (error) {
    console.error("Admin posts load failed:", error.message);
    return { posts: [], total: 0 };
  }

  return {
    posts: (data ?? []).map((row) => mapPost(row as unknown as RawPostRow)),
    total: count ?? 0,
  };
}

/** Full row (incl. content_json) for the editor — admin-only, any status. */
export async function getPostForEdit(
  supabase: SupabaseClient,
  id: string,
): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Post-for-edit load failed:", error.message);
    return null;
  }
  return data ? mapPost(data as unknown as RawPostDetailRow) : null;
}

export type AdjacentPost = { slug: string; title: string };

/** Chronological prev/next among published posts, for the article page's nav. */
export const getAdjacentPosts = cache(
  async (
    postId: string,
    publishedAt: string | null,
  ): Promise<{ previous: AdjacentPost | null; next: AdjacentPost | null }> => {
    if (!publishedAt) return { previous: null, next: null };

    const supabase = createPublicClient();
    const [{ data: previous }, { data: next }] = await Promise.all([
      supabase
        .from("blog_posts")
        .select("slug, title")
        .eq("status", "published")
        .neq("id", postId)
        .lt("published_at", publishedAt)
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("blog_posts")
        .select("slug, title")
        .eq("status", "published")
        .neq("id", postId)
        .gt("published_at", publishedAt)
        .order("published_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    return { previous: previous ?? null, next: next ?? null };
  },
);

/**
 * "Internal linking": prefers posts sharing this one's category OR tags,
 * then tops up with the most recently published posts if that isn't enough
 * to fill `limit` — so the section is never empty just because a post has
 * no category/tags set.
 */
export const getRelatedPosts = cache(
  async (
    postId: string,
    categoryId: string | null,
    limit = RELATED_POSTS_LIMIT,
  ): Promise<BlogPostSummary[]> => {
    const supabase = createPublicClient();

    const { data: tagRows } = await supabase
      .from("blog_post_tags")
      .select("tag_id")
      .eq("post_id", postId);
    const tagIds = (tagRows ?? []).map((row) => row.tag_id as string);

    let sharedTagPostIds: string[] = [];
    if (tagIds.length > 0) {
      const { data: relatedTagRows } = await supabase
        .from("blog_post_tags")
        .select("post_id")
        .in("tag_id", tagIds)
        .neq("post_id", postId);
      sharedTagPostIds = [...new Set((relatedTagRows ?? []).map((row) => row.post_id as string))];
    }

    let posts: BlogPostSummary[] = [];
    if (categoryId || sharedTagPostIds.length > 0) {
      let query = supabase
        .from("blog_posts")
        .select(SUMMARY_SELECT)
        .eq("status", "published")
        .neq("id", postId);

      const orParts: string[] = [];
      if (categoryId) orParts.push(`category_id.eq.${categoryId}`);
      if (sharedTagPostIds.length > 0) orParts.push(`id.in.(${sharedTagPostIds.join(",")})`);
      query = query.or(orParts.join(","));

      const { data, error } = await query.order("published_at", { ascending: false }).limit(limit);
      if (error) console.error("Related posts load failed:", error.message);
      posts = (data ?? []).map((row) => mapPost(row as unknown as RawPostRow));
    }

    if (posts.length < limit) {
      const excludeIds = new Set([postId, ...posts.map((post) => post.id)]);
      const { data: recentData, error: recentError } = await supabase
        .from("blog_posts")
        .select(SUMMARY_SELECT)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(limit + excludeIds.size);

      if (recentError) {
        console.error("Related posts fallback load failed:", recentError.message);
      } else {
        const recentPosts = (recentData ?? [])
          .map((row) => mapPost(row as unknown as RawPostRow))
          .filter((post) => !excludeIds.has(post.id))
          .slice(0, limit - posts.length);
        posts = [...posts, ...recentPosts];
      }
    }

    return posts;
  },
);
