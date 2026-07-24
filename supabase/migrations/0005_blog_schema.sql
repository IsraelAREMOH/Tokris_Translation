-- 0005_blog_schema.sql
-- RUN THIS in the Supabase SQL Editor (new — required for the Blog/CMS phase).
--
-- Adds the Blog/CMS tables: categories, tags, authors, posts (+ tag join),
-- a SITE-WIDE media library (not blog-specific — every part of the site can
-- reuse uploaded assets), newsletter subscribers, per-view analytics, and
-- slug-redirect history. RLS policies and the storage bucket are added in
-- 0006/0007 — this file is schema only.

create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Central, site-wide media repository — referenced by blog posts/authors
-- today, and intended for reuse by future page editors (Homepage, Services,
-- Team, etc.), not just the blog. `folder` is freeform text (no fixed list)
-- so new site sections can adopt their own folder without a migration.
create table if not exists public.media_library (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text not null,
  file_type text not null check (file_type in ('image', 'pdf', 'video', 'document')),
  mime_type text,
  size_bytes bigint,
  width integer,
  height integer,
  alt_text text,
  folder text not null default 'uploads',
  uploaded_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.blog_authors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  photo_id uuid references public.media_library(id) on delete set null,
  bio text,
  position text,
  email text,
  social_links jsonb not null default '{}',
  featured boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- locale defaults to 'en' and is the only value used while the blog is
-- English-only; the column exists so French can be turned on later without a
-- migration.
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  locale text not null default 'en' check (locale in ('en', 'fr')),
  title text not null,
  excerpt text,
  content_json jsonb not null default '{}',
  content_html text not null default '',
  content_text text not null default '',
  reading_time_minutes integer not null default 1,
  cover_image_id uuid references public.media_library(id) on delete set null,
  cover_image_alt text,
  category_id uuid references public.blog_categories(id) on delete set null,
  author_id uuid references public.blog_authors(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'published', 'archived')),
  featured boolean not null default false,
  featured_order integer not null default 0,
  published_at timestamp with time zone,
  scheduled_at timestamp with time zone,
  seo_title text,
  meta_description text,
  canonical_url text,
  og_image_id uuid references public.media_library(id) on delete set null,
  allow_comments boolean not null default true,
  view_count integer not null default 0,
  search_vector tsvector generated always as (
    to_tsvector('english', title || ' ' || coalesce(excerpt, '') || ' ' || content_text)
  ) stored,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.blog_post_tags (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id uuid not null references public.blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- Preserves old slugs when a post is renamed, so old links 301 to the
-- current slug instead of 404ing. Written by the post-update action
-- whenever `slug` changes (Phase 3); read by the public detail page.
create table if not exists public.blog_post_slug_redirects (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  old_slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  source text not null default 'blog',
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unsubscribed_at timestamp with time zone
);

create table if not exists public.post_views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  viewed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  referrer text
);

-- Indexes backing the public listing/filter queries and the policies below.
create index if not exists blog_posts_status_published_idx on public.blog_posts (status, published_at desc);
create index if not exists blog_posts_category_idx on public.blog_posts (category_id);
create index if not exists blog_posts_author_idx on public.blog_posts (author_id);
create index if not exists blog_posts_search_idx on public.blog_posts using gin (search_vector);
create index if not exists blog_posts_cover_image_idx on public.blog_posts (cover_image_id);
create index if not exists blog_posts_og_image_idx on public.blog_posts (og_image_id);
create index if not exists blog_post_tags_tag_idx on public.blog_post_tags (tag_id);
create index if not exists blog_post_slug_redirects_post_idx on public.blog_post_slug_redirects (post_id);
create index if not exists blog_authors_photo_idx on public.blog_authors (photo_id);
create index if not exists media_library_folder_idx on public.media_library (folder);
create index if not exists media_library_type_idx on public.media_library (file_type);
create index if not exists post_views_post_idx on public.post_views (post_id, viewed_at);

-- Keeps blog_posts.updated_at accurate for "Recent activity" and sitemap lastmod.
create or replace function public.set_blog_post_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_blog_post_updated_at();

-- Records a public page view and bumps the denormalized counter in one call.
-- SECURITY DEFINER so anonymous visitors can call it without needing insert
-- rights on post_views or update rights on blog_posts directly.
create or replace function public.record_post_view(p_post_id uuid, p_referrer text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.post_views (post_id, referrer) values (p_post_id, p_referrer);
  update public.blog_posts set view_count = view_count + 1 where id = p_post_id;
end;
$$;

grant execute on function public.record_post_view(uuid, text) to anon, authenticated;

alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.media_library enable row level security;
alter table public.blog_authors enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_post_tags enable row level security;
alter table public.blog_post_slug_redirects enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.post_views enable row level security;
