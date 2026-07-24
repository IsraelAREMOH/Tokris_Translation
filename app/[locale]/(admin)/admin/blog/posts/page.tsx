import { Plus } from "lucide-react";
import type { Metadata } from "next";

import { Pagination } from "@/components/ui/pagination";
import { PostFilters } from "@/components/admin/blog/post-filters";
import { PostsManager } from "@/components/admin/blog/posts-manager";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getAuthors } from "@/lib/blog/authors/queries";
import { getCategories } from "@/lib/blog/categories/queries";
import {
  ADMIN_POSTS_PAGE_SIZE,
  isAdminPostSortField,
  isBlogPostStatus,
  type PostListView,
} from "@/lib/blog/posts/constants";
import { getAdminPosts } from "@/lib/blog/posts/queries";
import { getTags } from "@/lib/blog/tags/queries";
import { UUID_PATTERN } from "@/lib/validation";

export const metadata: Metadata = { title: "Blog Posts" };

export default async function AdminBlogPostsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    category?: string;
    author?: string;
    tag?: string;
    sort?: string;
    dir?: string;
    view?: string;
    page?: string;
  }>;
}) {
  const [params, { supabase }] = await Promise.all([searchParams, requireAdmin()]);

  const status = params.status && isBlogPostStatus(params.status) ? params.status : undefined;
  const categoryId = params.category && UUID_PATTERN.test(params.category) ? params.category : undefined;
  const authorId = params.author && UUID_PATTERN.test(params.author) ? params.author : undefined;
  const tagId = params.tag && UUID_PATTERN.test(params.tag) ? params.tag : undefined;
  const sortBy = params.sort && isAdminPostSortField(params.sort) ? params.sort : "updated_at";
  const sortDir = params.dir === "asc" ? "asc" : "desc";
  const view: PostListView = params.view === "cards" ? "cards" : "table";
  const page = Math.max(1, Number(params.page) || 1);

  const [{ posts, total }, categories, authors, tags] = await Promise.all([
    getAdminPosts(supabase, {
      search: params.q,
      status,
      categoryId,
      authorId,
      tagId,
      sortBy,
      sortDir,
      page,
    }),
    getCategories(),
    getAuthors(),
    getTags(),
  ]);

  const hasFilters = Boolean(params.q || status || categoryId || authorId || tagId);

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
            Blog Posts
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Write, schedule and publish articles.
          </p>
        </div>
        <Link
          href="/admin/blog/posts/new"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          New post
        </Link>
      </div>

      <PostFilters
        status={status}
        categoryId={categoryId}
        authorId={authorId}
        tagId={tagId}
        sort={sortBy}
        dir={sortDir}
        view={view}
        categories={categories}
        authors={authors}
        tags={tags}
      />

      <PostsManager posts={posts} view={view} hasFilters={hasFilters} />

      <Pagination
        page={page}
        pageSize={ADMIN_POSTS_PAGE_SIZE}
        total={total}
        basePath="/admin/blog/posts"
        searchParams={{
          q: params.q,
          status,
          category: categoryId,
          author: authorId,
          tag: tagId,
          sort: sortBy,
          dir: sortDir,
          view,
        }}
      />
    </div>
  );
}
