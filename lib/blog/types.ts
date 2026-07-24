// Shared shapes for the Blog/CMS — mirrors the row shapes defined in
// supabase/migrations/0005_blog_schema.sql. No generated Supabase types exist
// in this project (see lib/admin/actions.ts's `as unknown as X` casts), so
// query helpers cast raw rows into these by hand, same convention.

import type { MediaAsset } from "@/lib/media/types";

export type BlogPostStatus = "draft" | "scheduled" | "published" | "archived";

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
};

export type BlogTag = {
  id: string;
  name: string;
  slug: string;
};

export type BlogAuthor = {
  id: string;
  profile_id: string | null;
  name: string;
  photo_id: string | null;
  photo: MediaAsset | null;
  bio: string | null;
  position: string | null;
  email: string | null;
  social_links: Record<string, string>;
  featured: boolean;
};

/** List/card view — excludes the heavy content_json blob. */
export type BlogPostSummary = {
  id: string;
  slug: string;
  locale: string;
  title: string;
  excerpt: string | null;
  content_html: string;
  reading_time_minutes: number;
  cover_image_id: string | null;
  cover_image: MediaAsset | null;
  cover_image_alt: string | null;
  category_id: string | null;
  author_id: string | null;
  status: BlogPostStatus;
  featured: boolean;
  featured_order: number;
  pinned: boolean;
  pinned_at: string | null;
  published_at: string | null;
  scheduled_at: string | null;
  seo_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_image_id: string | null;
  og_image: MediaAsset | null;
  allow_comments: boolean;
  view_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  category: BlogCategory | null;
  author: BlogAuthor | null;
  tags: BlogTag[];
};

/** Detail/edit view — the full row, including the editor's source of truth. */
export type BlogPost = BlogPostSummary & {
  content_json: unknown;
  content_text: string;
};
