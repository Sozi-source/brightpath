-- BrightPath: Migration 002 - Auth Trigger & Security Fixes
-- Run this in the Supabase SQL Editor once connection is restored.

-- 1. Automatically create a profile when a new user signs up in auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Prevent role escalation (users cannot grant themselves 'admin' or 'trainer')
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (new.role is distinct from old.role) and not is_admin() then
    raise exception 'Unauthorized: Only administrators can modify roles.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_role_change on public.profiles;
create trigger enforce_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- 3. Secure platform_settings with RLS
alter table public.platform_settings enable row level security;

drop policy if exists "anyone can read platform_settings" on public.platform_settings;
create policy "anyone can read platform_settings" on public.platform_settings
  for select using (true);

drop policy if exists "admin can manage platform_settings" on public.platform_settings;
create policy "admin can manage platform_settings" on public.platform_settings
  for all using (is_admin());

-- 4. Allow users to insert their own profile on signup if trigger is delayed
drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles
  for insert with check (id = auth.uid() and role = 'student');
