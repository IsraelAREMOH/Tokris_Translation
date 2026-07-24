import type { BlogPostStatus } from "@/lib/blog/types";
import type { AdminPostSortField } from "@/lib/blog/posts/queries";

export const BLOG_POST_STATUSES: BlogPostStatus[] = [
  "draft",
  "scheduled",
  "published",
  "archived",
];

export function isBlogPostStatus(value: string): value is BlogPostStatus {
  return (BLOG_POST_STATUSES as string[]).includes(value);
}

/** Public landing/archive pages — one page size everywhere. */
export const BLOG_PAGE_SIZE = 9;
export const ADMIN_POSTS_PAGE_SIZE = 20;

export const RELATED_POSTS_LIMIT = 3;
export const LATEST_INSIGHTS_LIMIT = 3;
export const POPULAR_POSTS_LIMIT = 5;

/** Words-per-minute used to derive reading_time_minutes at save time. */
export const READING_SPEED_WPM = 200;

/**
 * "Configurable" per the spec means centralized-in-one-constant, not a UI
 * setting — a settings screen for a single interval number would be
 * over-engineering for a solo operator. Change this to retune it.
 */
export const AUTOSAVE_INTERVAL_MS = 30_000;

export const ADMIN_POST_SORT_OPTIONS: { value: AdminPostSortField; label: string }[] = [
  { value: "updated_at", label: "Last updated" },
  { value: "published_at", label: "Publish date" },
  { value: "title", label: "Title" },
  { value: "view_count", label: "Views" },
];

export function isAdminPostSortField(value: string): value is AdminPostSortField {
  return ADMIN_POST_SORT_OPTIONS.some((option) => option.value === value);
}

export type PostListView = "table" | "cards";
