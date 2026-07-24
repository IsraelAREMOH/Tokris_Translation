-- 0006_blog_policies.sql
-- RUN THIS in the Supabase SQL Editor (new — required for the Blog/CMS phase).
--
-- RLS policies for the tables added in 0005, reusing the public.is_admin()
-- helper from 0002 (never re-implement admin checks). Shape:
--   - Taxonomy (categories/tags/authors/post_tags) and media_library:
--     public read, admin write. Media metadata isn't sensitive — the files
--     themselves are already public via the 'site-media' bucket (0007), and
--     public read lets post/author queries embed the media join directly
--     instead of denormalizing storage paths onto every referencing table.
--   - Posts: public read of published (+ due-scheduled) posts, admin all.
--   - Slug redirects: public read (an anonymous visitor hitting an old post
--     URL needs to resolve it), admin write.
--   - Newsletter subscribers: anyone may insert their own signup; only admins
--     may read/update/delete.
--   - post_views: no direct grants for anon/authenticated — all writes go
--     through the record_post_view() SECURITY DEFINER function from 0005.

-- 1) BLOG_CATEGORIES ---------------------------------------------------------

drop policy if exists "Anyone can view categories" on public.blog_categories;
create policy "Anyone can view categories"
  on public.blog_categories for select
  using (true);

drop policy if exists "Admins can manage categories" on public.blog_categories;
create policy "Admins can manage categories"
  on public.blog_categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 2) BLOG_TAGS ----------------------------------------------------------------

drop policy if exists "Anyone can view tags" on public.blog_tags;
create policy "Anyone can view tags"
  on public.blog_tags for select
  using (true);

drop policy if exists "Admins can manage tags" on public.blog_tags;
create policy "Admins can manage tags"
  on public.blog_tags for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3) MEDIA_LIBRARY --------------------------------------------------------------

drop policy if exists "Anyone can view media" on public.media_library;
create policy "Anyone can view media"
  on public.media_library for select
  using (true);

drop policy if exists "Admins can manage media" on public.media_library;
create policy "Admins can manage media"
  on public.media_library for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4) BLOG_AUTHORS -------------------------------------------------------------

drop policy if exists "Anyone can view authors" on public.blog_authors;
create policy "Anyone can view authors"
  on public.blog_authors for select
  using (true);

drop policy if exists "Admins can manage authors" on public.blog_authors;
create policy "Admins can manage authors"
  on public.blog_authors for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5) BLOG_POSTS ---------------------------------------------------------------

-- Public visitors (and the anon key) see published posts, plus scheduled
-- posts whose scheduled_at has already passed (no cron flips the status —
-- see the plan's "Scheduling" note).
drop policy if exists "Anyone can view published posts" on public.blog_posts;
create policy "Anyone can view published posts"
  on public.blog_posts for select
  using (
    status = 'published'
    or (status = 'scheduled' and scheduled_at <= timezone('utc'::text, now()))
  );

drop policy if exists "Admins can view all posts" on public.blog_posts;
create policy "Admins can view all posts"
  on public.blog_posts for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can create posts" on public.blog_posts;
create policy "Admins can create posts"
  on public.blog_posts for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update posts" on public.blog_posts;
create policy "Admins can update posts"
  on public.blog_posts for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete posts" on public.blog_posts;
create policy "Admins can delete posts"
  on public.blog_posts for delete
  to authenticated
  using (public.is_admin());

-- 6) BLOG_POST_TAGS -------------------------------------------------------------

drop policy if exists "Anyone can view post tags" on public.blog_post_tags;
create policy "Anyone can view post tags"
  on public.blog_post_tags for select
  using (true);

drop policy if exists "Admins can manage post tags" on public.blog_post_tags;
create policy "Admins can manage post tags"
  on public.blog_post_tags for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 7) BLOG_POST_SLUG_REDIRECTS -----------------------------------------------------

drop policy if exists "Anyone can resolve slug redirects" on public.blog_post_slug_redirects;
create policy "Anyone can resolve slug redirects"
  on public.blog_post_slug_redirects for select
  using (true);

drop policy if exists "Admins can manage slug redirects" on public.blog_post_slug_redirects;
create policy "Admins can manage slug redirects"
  on public.blog_post_slug_redirects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 8) NEWSLETTER_SUBSCRIBERS -------------------------------------------------------

drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (true);

drop policy if exists "Admins can view subscribers" on public.newsletter_subscribers;
create policy "Admins can view subscribers"
  on public.newsletter_subscribers for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update subscribers" on public.newsletter_subscribers;
create policy "Admins can update subscribers"
  on public.newsletter_subscribers for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete subscribers" on public.newsletter_subscribers;
create policy "Admins can delete subscribers"
  on public.newsletter_subscribers for delete
  to authenticated
  using (public.is_admin());

-- 9) POST_VIEWS -------------------------------------------------------------------
-- Intentionally no insert policy for anon/authenticated: rows are written by
-- record_post_view(), a SECURITY DEFINER function that bypasses RLS.

drop policy if exists "Admins can view post views" on public.post_views;
create policy "Admins can view post views"
  on public.post_views for select
  to authenticated
  using (public.is_admin());
