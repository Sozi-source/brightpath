-- Student & Trainer Projects Platform: Supabase schema (v1)
-- Run in the Supabase SQL editor.

create type user_role as enum ('student', 'trainer', 'admin');
create type trainer_status as enum ('pending', 'approved', 'suspended');
create type content_status as enum ('draft', 'pending_review', 'published', 'rejected');
create type order_status as enum ('pending', 'paid', 'failed');

-- Platform-wide settings (e.g. commission percentage)
create table platform_settings (
  id int primary key default 1,
  commission_percent numeric(5,2) not null default 20.00,
  constraint single_row check (id = 1)
);
insert into platform_settings default values;

-- Every user has a profile linked to Supabase auth
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role user_role not null default 'student',
  course text,            -- students
  level text,             -- students
  institution text,       -- trainers
  created_at timestamptz default now()
);

-- Extra details for trainers. Only the Paystack subaccount code is stored;
-- bank details go straight to Paystack when the subaccount is created.
create table trainer_profiles (
  user_id uuid primary key references profiles(id) on delete cascade,
  bio text,
  subjects text[],
  status trainer_status not null default 'pending',
  paystack_subaccount_code text,
  approved_at timestamptz
);

-- Guide content: modules contain lessons
create table modules (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references profiles(id),
  title text not null,
  description text,
  position int not null default 0,
  status content_status not null default 'draft',
  created_at timestamptz default now()
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  body text,                -- rich text / markdown
  video_url text,
  position int not null default 0,
  is_free boolean not null default false,
  created_at timestamptz default now()
);

-- Templates/checklists attached to a lesson
create table lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  title text not null,
  file_path text not null   -- path in private storage bucket
);

create table lesson_progress (
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  completed_at timestamptz default now(),
  primary key (user_id, lesson_id)
);

-- Ready-made projects for sale
create table projects (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references profiles(id),
  title text not null,
  description text,
  category text,
  price_kes numeric(10,2) not null check (price_kes >= 0),
  file_path text not null,      -- private bucket: project-files
  preview_path text,            -- public or signed preview
  download_count integer not null default 0 check (download_count >= 0),
  status content_status not null default 'pending_review',
  created_at timestamptz default now()
);

create unique index projects_workspace_export_file_path_unique
  on projects(file_path) where file_path like 'workspace-export:%';

create or replace function increment_project_download(p_project_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update projects set download_count = download_count + 1 where id = p_project_id;
$$;

revoke all on function increment_project_download(uuid) from public;
grant execute on function increment_project_download(uuid) to service_role;

-- Orders: commission and trainer share are fixed at purchase time
create table orders (
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

create table project_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  unique (project_id, student_id)
);

create table project_plan_snapshots (
  project_id uuid primary key references projects(id) on delete cascade,
  workspace_id uuid not null unique,
  title text not null,
  course text not null,
  level text not null,
  sections jsonb not null,
  created_at timestamptz not null default now()
);

-- Content reports from students
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id),
  project_id uuid references projects(id),
  lesson_id uuid references lessons(id),
  reason text not null,
  created_at timestamptz default now()
);

-- ---------- Row-level security ----------
alter table profiles enable row level security;
alter table trainer_profiles enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table lesson_resources enable row level security;
alter table lesson_progress enable row level security;
alter table projects enable row level security;
alter table orders enable row level security;
alter table project_reviews enable row level security;
alter table project_plan_snapshots enable row level security;
alter table reports enable row level security;

create or replace function is_admin() returns boolean
language sql stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Profiles: own row, admin sees all
create policy "own profile" on profiles for select using (id = auth.uid() or is_admin());
create policy "update own profile" on profiles for update using (id = auth.uid());

-- Trainer profiles: own row or admin
create policy "own trainer profile" on trainer_profiles for select using (user_id = auth.uid() or is_admin());
create policy "admin manages trainers" on trainer_profiles for all using (is_admin());

-- Modules and lessons: published visible to everyone signed in; trainers manage their own
create policy "read published modules" on modules for select
  using (status = 'published' or trainer_id = auth.uid() or is_admin());
create policy "trainer manages own modules" on modules for all
  using (trainer_id = auth.uid() or is_admin());

create policy "read lessons of visible modules" on lessons for select
  using (exists (select 1 from modules m where m.id = module_id
    and (m.status = 'published' or m.trainer_id = auth.uid() or is_admin())));
create policy "trainer manages own lessons" on lessons for all
  using (exists (select 1 from modules m where m.id = module_id
    and (m.trainer_id = auth.uid() or is_admin())));

-- Progress: own rows only
create policy "own progress" on lesson_progress for all using (user_id = auth.uid());

-- Projects: published are listed; trainers manage their own
create policy "read published projects" on projects for select
  using (status = 'published' or trainer_id = auth.uid() or is_admin());
create policy "trainer manages own projects" on projects for all
  using (trainer_id = auth.uid() or is_admin());

-- Orders: student sees own, trainer sees sales of own projects, admin sees all.
-- Inserts and updates happen server-side only (service role) via the Paystack webhook.
create policy "read own orders" on orders for select
  using (student_id = auth.uid() or trainer_id = auth.uid() or is_admin());

create policy "read marketplace reviews" on project_reviews for select using (
  student_id = auth.uid() or is_admin() or exists (
    select 1 from projects p where p.id = project_reviews.project_id and p.trainer_id = auth.uid()
  )
);
create policy "buyers write their own reviews" on project_reviews for insert with check (
  student_id = auth.uid() and exists (
    select 1 from orders o where o.project_id = project_reviews.project_id and o.student_id = auth.uid() and o.status = 'paid'
  )
);
create policy "buyers update their own reviews" on project_reviews for update using (student_id = auth.uid()) with check (
  student_id = auth.uid() and exists (
    select 1 from orders o where o.project_id = project_reviews.project_id and o.student_id = auth.uid() and o.status = 'paid'
  )
);

create policy "buyers read purchased business plan snapshots" on project_plan_snapshots for select using (
  exists (
    select 1 from projects p
    where p.id = project_plan_snapshots.project_id
      and (p.trainer_id = auth.uid() or is_admin()
        or exists (select 1 from orders o where o.project_id = p.id and o.student_id = auth.uid() and o.status = 'paid'))
  )
);

create or replace view marketplace_project_rating_stats with (security_barrier = true) as
  select r.project_id, round(avg(r.rating)::numeric, 2) as rating_average, count(*)::integer as review_count
  from project_reviews r
  join projects p on p.id = r.project_id
  where p.status = 'published'
  group by r.project_id;
grant select on marketplace_project_rating_stats to anon, authenticated;

-- Reports: anyone signed in can file; admin reads
create policy "file report" on reports for insert with check (reporter_id = auth.uid());
create policy "admin reads reports" on reports for select using (is_admin());

-- Download rule (enforced in the server route that creates signed URLs):
-- allow only if exists(select 1 from orders where student_id = auth.uid()
--   and project_id = :project and status = 'paid')
