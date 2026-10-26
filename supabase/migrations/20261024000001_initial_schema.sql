-- Migration: 20261024000001_initial_schema.sql
-- Baseline BrightPath schema

do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('student', 'trainer', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'trainer_status') then
    create type trainer_status as enum ('pending', 'approved', 'suspended');
  end if;
  if not exists (select 1 from pg_type where typname = 'content_status') then
    create type content_status as enum ('draft', 'pending_review', 'published', 'rejected');
  end if;
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum ('pending', 'paid', 'failed');
  end if;
end $$;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role user_role not null default 'student',
  course text,
  level text,
  institution text,
  created_at timestamptz default now()
);

create table if not exists trainer_profiles (
  user_id uuid primary key references profiles(id) on delete cascade,
  bio text,
  subjects text[],
  status trainer_status not null default 'pending',
  paystack_subaccount_code text,
  approved_at timestamptz
);

create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references profiles(id),
  title text not null,
  description text,
  position int not null default 0,
  status content_status not null default 'draft',
  created_at timestamptz default now()
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  body text,
  video_url text,
  position int not null default 0,
  is_free boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  title text not null,
  file_path text not null
);

create table if not exists lesson_progress (
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  completed_at timestamptz default now(),
  primary key (user_id, lesson_id)
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references profiles(id),
  title text not null,
  description text,
  category text,
  price_kes numeric(10,2) not null check (price_kes >= 0),
  file_path text not null,
  preview_path text,
  status content_status not null default 'pending_review',
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id),
  project_id uuid not null references projects(id),
  trainer_id uuid not null references profiles(id),
  amount_kes numeric(10,2) not null,
  commission_kes numeric(10,2) not null,
  trainer_share_kes numeric(10,2) not null,
  paystack_reference text unique not null,
  status order_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id),
  project_id uuid references projects(id),
  lesson_id uuid references lessons(id),
  reason text not null,
  created_at timestamptz default now()
);

create table if not exists platform_settings (
  id int primary key default 1 check (id = 1),
  commission_percent numeric(5,2) not null default 20.00 check (commission_percent >= 0 and commission_percent <= 100),
  updated_at timestamptz default now()
);

insert into platform_settings (id, commission_percent)
values (1, 20.00)
on conflict (id) do nothing;

create or replace function is_admin() returns boolean
language sql stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

alter table profiles enable row level security;
alter table trainer_profiles enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table lesson_resources enable row level security;
alter table lesson_progress enable row level security;
alter table projects enable row level security;
alter table orders enable row level security;
alter table reports enable row level security;
alter table platform_settings enable row level security;

drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles for select using (id = auth.uid() or is_admin());

drop policy if exists "update own profile" on profiles;
create policy "update own profile" on profiles for update using (id = auth.uid());

drop policy if exists "own trainer profile" on trainer_profiles;
create policy "own trainer profile" on trainer_profiles for select using (user_id = auth.uid() or is_admin());

drop policy if exists "admin manages trainers" on trainer_profiles;
create policy "admin manages trainers" on trainer_profiles for all using (is_admin());

drop policy if exists "read published modules" on modules;
create policy "read published modules" on modules for select
  using (status = 'published' or trainer_id = auth.uid() or is_admin());

drop policy if exists "trainer manages own modules" on modules;
create policy "trainer manages own modules" on modules for all
  using (trainer_id = auth.uid() or is_admin());

drop policy if exists "read lessons of visible modules" on lessons;
create policy "read lessons of visible modules" on lessons for select
  using (exists (select 1 from modules m where m.id = module_id
    and (m.status = 'published' or m.trainer_id = auth.uid() or is_admin())));

drop policy if exists "trainer manages own lessons" on lessons;
create policy "trainer manages own lessons" on lessons for all
  using (exists (select 1 from modules m where m.id = module_id
    and (m.trainer_id = auth.uid() or is_admin())));

drop policy if exists "own progress" on lesson_progress;
create policy "own progress" on lesson_progress for all using (user_id = auth.uid());

drop policy if exists "read published projects" on projects;
create policy "read published projects" on projects for select
  using (status = 'published' or trainer_id = auth.uid() or is_admin());

drop policy if exists "trainer manages own projects" on projects;
create policy "trainer manages own projects" on projects for all
  using (trainer_id = auth.uid() or is_admin());

drop policy if exists "anyone can read platform_settings" on platform_settings;
create policy "anyone can read platform_settings" on platform_settings for select using (true);

drop policy if exists "admin can manage platform_settings" on platform_settings;
create policy "admin can manage platform_settings" on platform_settings for all using (is_admin());
