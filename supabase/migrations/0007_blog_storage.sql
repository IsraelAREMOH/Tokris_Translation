-- 0007_blog_storage.sql
-- RUN THIS in the Supabase SQL Editor (new — required for the Blog/CMS phase).
--
-- Adds the 'site-media' Storage bucket — a SITE-WIDE public media bucket,
-- not blog-specific (matches media_library being a shared repository for
-- the whole site). Unlike 'translations' (private, per-client folders),
-- this bucket is PUBLIC: uploaded images/video/documents must be readable by
-- anonymous site visitors, served directly via their public URL (no signed
-- URLs needed, better for caching/next/image). Admin-only writes, mirroring
-- 0003's admin storage policy shape.

insert into storage.buckets (id, name, public, file_size_limit)
values ('site-media', 'site-media', true, 26214400) -- 25 MB
on conflict (id) do nothing;

drop policy if exists "Anyone can view site media" on storage.objects;
create policy "Anyone can view site media"
  on storage.objects for select
  using (bucket_id = 'site-media');

drop policy if exists "Admins can upload site media" on storage.objects;
create policy "Admins can upload site media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "Admins can update site media" on storage.objects;
create policy "Admins can update site media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-media' and public.is_admin())
  with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "Admins can delete site media" on storage.objects;
create policy "Admins can delete site media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-media' and public.is_admin());
