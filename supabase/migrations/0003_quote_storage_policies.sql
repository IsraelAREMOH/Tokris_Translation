-- 0003_quote_storage_policies.sql
-- RUN THIS in the Supabase SQL Editor (new — required for the quote phase).
--
-- Adds:
--   1. The private 'translations' Storage bucket.
--   2. RLS policies for projects / project_files / messages
--      (clients see only their own rows, admins see everything).
--   3. Storage object policies — files live under {client_id}/{project_id}/...
--      so the first folder name gates client access.
--   4. Foreign-key indexes used by the policies and portal queries.

-- 1) Private storage bucket (10 MB per-file cap, matches the app limit).
insert into storage.buckets (id, name, public, file_size_limit)
values ('translations', 'translations', false, 10485760)
on conflict (id) do nothing;

-- 2) PROJECTS ---------------------------------------------------------------

drop policy if exists "Clients can view own projects" on public.projects;
create policy "Clients can view own projects"
  on public.projects for select
  using (client_id = auth.uid());

drop policy if exists "Admins can view all projects" on public.projects;
create policy "Admins can view all projects"
  on public.projects for select
  using (public.is_admin());

drop policy if exists "Clients can create own projects" on public.projects;
create policy "Clients can create own projects"
  on public.projects for insert
  to authenticated
  with check (client_id = auth.uid());

-- Lets a client cancel (and the app roll back) a request that the operator
-- has not started reviewing yet.
drop policy if exists "Clients can delete own submitted projects" on public.projects;
create policy "Clients can delete own submitted projects"
  on public.projects for delete
  using (client_id = auth.uid() and status = 'Request Submitted');

-- Status transitions are manual and admin-only in V1.
drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects"
  on public.projects for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete projects" on public.projects;
create policy "Admins can delete projects"
  on public.projects for delete
  using (public.is_admin());

-- 3) PROJECT_FILES ----------------------------------------------------------

drop policy if exists "Clients can view own project files" on public.project_files;
create policy "Clients can view own project files"
  on public.project_files for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.client_id = auth.uid()
    )
  );

drop policy if exists "Admins can view all project files" on public.project_files;
create policy "Admins can view all project files"
  on public.project_files for select
  using (public.is_admin());

-- Clients attach source documents to their own projects; admins attach
-- anything (e.g. completed translations).
drop policy if exists "Participants can add project files" on public.project_files;
create policy "Participants can add project files"
  on public.project_files for insert
  to authenticated
  with check (
    uploaded_by = auth.uid()
    and (
      public.is_admin()
      or (
        file_type = 'source'
        and exists (
          select 1 from public.projects p
          where p.id = project_id and p.client_id = auth.uid()
        )
      )
    )
  );

drop policy if exists "Admins can delete project files" on public.project_files;
create policy "Admins can delete project files"
  on public.project_files for delete
  using (public.is_admin());

-- 4) MESSAGES ---------------------------------------------------------------

drop policy if exists "Participants can view messages" on public.messages;
create policy "Participants can view messages"
  on public.messages for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.client_id = auth.uid()
    )
  );

drop policy if exists "Participants can send messages" on public.messages;
create policy "Participants can send messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and (
      public.is_admin()
      or exists (
        select 1 from public.projects p
        where p.id = project_id and p.client_id = auth.uid()
      )
    )
  );

-- 5) STORAGE OBJECTS --------------------------------------------------------
-- Object paths: {client_id}/{project_id}/{source|completed}/{filename}
-- The first folder segment is the owning client's uid.

drop policy if exists "Clients can upload to own folder" on storage.objects;
create policy "Clients can upload to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'translations'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Clients can read own folder" on storage.objects;
create policy "Clients can read own folder"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'translations'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Clients can delete own folder objects" on storage.objects;
create policy "Clients can delete own folder objects"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'translations'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Admins can manage all translation files" on storage.objects;
create policy "Admins can manage all translation files"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'translations' and public.is_admin())
  with check (bucket_id = 'translations' and public.is_admin());

-- 6) Indexes backing the policy lookups and portal queries.
create index if not exists projects_client_id_idx on public.projects (client_id);
create index if not exists project_files_project_id_idx on public.project_files (project_id);
create index if not exists messages_project_id_idx on public.messages (project_id);
