-- 0010_cms_foundation.sql
-- RUN THIS in the Supabase SQL Editor (new — required for the Phase 6 CMS
-- foundation: Content Dashboard, Analytics, Newsletter management, the Pages
-- registry, and the Activity Feed).
--
-- Adds two tables:
--   - `pages`: a lightweight registry of the site's public pages (Home,
--     Services, About, Quote, Contact) so the admin Pages module has
--     something real to list — status, last-updated, last-editor. Each row
--     also carries a nullable `content_json`/`content_html` pair, unused
--     today, so a future rich-text page editor has a column to write into
--     without another migration.
--   - `activity_log`: an append-only event feed written by existing admin
--     actions (post/category/tag/author/media saves, newsletter signups).
--     Read-only from the UI's point of view; nothing ever updates a row.
--
-- Also adds two read-only RPCs, following the same pattern as
-- `record_post_view` (0005) and the search RPCs (0009):
--   - `log_newsletter_signup`: security-definer, so the anonymous newsletter
--     signup form can record an activity-log entry without a write grant on
--     activity_log itself.
--   - `get_daily_post_views`: aggregates `post_views` by day for the
--     Analytics page's "views over time" chart — plain SQL, no elevated
--     privilege, since `post_views` is already admin-only to select and this
--     runs as the calling (admin) user.

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  route text not null,
  status text not null default 'published' check (status in ('published', 'draft')),
  -- 'code': copy lives in messages/*.json + JSX, no admin-editable fields yet.
  -- 'site_content': fields live in the site_content table (Admin -> Site Content).
  -- 'rich_text': reserved for a future page editor — content_json/content_html below.
  edit_mode text not null default 'code' check (edit_mode in ('code', 'site_content', 'rich_text')),
  content_json jsonb,
  content_html text,
  -- Nullable, no default: seeding a row isn't "editing" it. Stays null for
  -- 'code' pages until a real edit path exists; only genuine edits (e.g.
  -- updateSiteContent() for 'contact') set this, so the admin Pages list
  -- never shows a fabricated "last updated" date.
  updated_at timestamp with time zone,
  updated_by uuid references public.profiles(id) on delete set null
);

insert into public.pages (slug, title, route, edit_mode) values
  ('home', 'Home', '/', 'code'),
  ('services', 'Services', '/services', 'code'),
  ('about', 'About', '/about', 'code'),
  ('quote', 'Request a Quote', '/quote', 'code'),
  ('contact', 'Contact', '/contact', 'site_content')
on conflict (slug) do nothing;

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  -- e.g. 'post.created', 'post.published', 'post.updated', 'category.created' —
  -- see lib/cms/activity/log.ts's ActivityEventType for the closed list.
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  title text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists activity_log_created_at_idx on public.activity_log (created_at desc);

alter table public.pages enable row level security;
alter table public.activity_log enable row level security;

drop policy if exists "Admins can manage pages" on public.pages;
create policy "Admins can manage pages"
  on public.pages for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can view activity" on public.activity_log;
create policy "Admins can view activity"
  on public.activity_log for select
  using (public.is_admin());

drop policy if exists "Admins can log activity" on public.activity_log;
create policy "Admins can log activity"
  on public.activity_log for insert
  with check (public.is_admin());

-- Only logs when p_subscriber_id is a real, existing row — otherwise this
-- security-definer function (callable directly by anon over PostgREST,
-- bypassing "Admins can log activity"'s check) would let anyone spam the
-- activity feed with arbitrary UUIDs that were never actually subscribed.
create or replace function public.log_newsletter_signup(p_subscriber_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.newsletter_subscribers where id = p_subscriber_id) then
    return;
  end if;
  insert into public.activity_log (event_type, entity_type, entity_id, title)
  values ('newsletter.subscribed', 'newsletter_subscriber', p_subscriber_id, 'New newsletter subscriber');
end;
$$;
grant execute on function public.log_newsletter_signup(uuid) to anon, authenticated;

create or replace function public.get_daily_post_views(p_days integer default 30)
returns table(day date, views bigint)
language sql stable as $$
  select date_trunc('day', viewed_at)::date as day, count(*) as views
  from public.post_views
  where viewed_at >= now() - (p_days || ' days')::interval
  group by 1
  order by 1;
$$;
grant execute on function public.get_daily_post_views(integer) to authenticated;
