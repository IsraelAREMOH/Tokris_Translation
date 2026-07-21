-- 0002_auth_profiles_policies.sql
-- RUN THIS in the Supabase SQL Editor (new — required for the auth phase).
--
-- 0001 enabled RLS on profiles but created no policies and no signup trigger,
-- so new users would get no profile row and role lookups would be denied.
-- This migration adds:
--   1. A trigger that auto-creates a profile for every new auth user.
--   2. A security-definer role helper (avoids recursive RLS lookups).
--   3. Row-level security policies for the profiles table.
--   4. Column-level grants so clients cannot promote their own role.

-- 1) Auto-create a profile whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone_number)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone_number', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) Role helper. SECURITY DEFINER bypasses RLS internally, which prevents
--    infinite recursion when admin policies need to read profiles.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 3) PROFILES row-level security policies.
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4) Privilege-escalation guard: clients may edit contact details only,
--    never their own role.
revoke update on table public.profiles from authenticated;
grant update (full_name, phone_number) on table public.profiles to authenticated;

-- 5) After registering your own account, promote it to admin by running
--    (replace the email address first):
--
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');
