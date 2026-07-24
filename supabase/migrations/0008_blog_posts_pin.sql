-- 0008_blog_posts_pin.sql
-- RUN THIS in the Supabase SQL Editor (new — required for the Phase 3 post
-- management upgrade).
--
-- Adds "pin to top" — distinct from `featured` (which drives the public
-- blog's hero section): pinned posts stay at the top of admin/public list
-- views regardless of publish date. pinned_at lets multiple pinned posts
-- order sensibly (most-recently-pinned first) instead of all tying.

alter table public.blog_posts
  add column if not exists pinned boolean not null default false,
  add column if not exists pinned_at timestamp with time zone;

create index if not exists blog_posts_pinned_idx on public.blog_posts (pinned, pinned_at desc);
