-- 0004_site_content.sql
-- RUN THIS in the Supabase SQL Editor (new — required for the Site Content phase).
--
-- Adds a small key-value store for site-wide settings the operator edits from
-- the admin console (Admin -> Site Content) without code changes:
--   whatsapp_number  -> powers the floating WhatsApp button on public pages
--   contact_email / contact_phone / office_address -> contact details, read by
--   public pages as they are wired up.

create table if not exists public.site_content (
  key text primary key,
  value text not null default '',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.site_content enable row level security;

-- Public pages render these values, so anyone may read them.
drop policy if exists "Anyone can read site content" on public.site_content;
create policy "Anyone can read site content"
  on public.site_content for select
  using (true);

drop policy if exists "Admins can insert site content" on public.site_content;
create policy "Admins can insert site content"
  on public.site_content for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update site content" on public.site_content;
create policy "Admins can update site content"
  on public.site_content for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Seed the editable keys (empty values fall back to env/static defaults).
insert into public.site_content (key, value)
values
  ('whatsapp_number', ''),
  ('contact_email', ''),
  ('contact_phone', ''),
  ('office_address', '')
on conflict (key) do nothing;
