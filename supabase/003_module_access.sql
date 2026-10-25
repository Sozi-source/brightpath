-- 003_module_access.sql
-- Curriculum module gating table and RLS policies
create table if not exists module_access (
  user_id uuid not null references profiles(id) on delete cascade,
  module_id uuid not null references modules(id) on delete cascade,
  granted_by text not null default 'purchase',   -- 'purchase' | 'institution' | 'admin'
  created_at timestamptz default now(),
  primary key (user_id, module_id)
);

alter table module_access enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'module_access' and policyname = 'own module access'
  ) then
    create policy "own module access" on module_access for select using (user_id = auth.uid() or is_admin());
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'module_access' and policyname = 'admin manages module access'
  ) then
    create policy "admin manages module access" on module_access for all using (is_admin());
  end if;
end $$;
