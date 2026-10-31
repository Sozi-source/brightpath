-- Allow completed student business plans to enter the existing marketplace review queue.
alter table public.projects
  add column if not exists download_count integer not null default 0 check (download_count >= 0);

create unique index if not exists projects_workspace_export_file_path_unique
  on public.projects(file_path)
  where file_path like 'workspace-export:%';

create or replace function public.increment_project_download(p_project_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.projects
  set download_count = download_count + 1
  where id = p_project_id;
$$;

revoke all on function public.increment_project_download(uuid) from public;
grant execute on function public.increment_project_download(uuid) to service_role;

create table if not exists public.project_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  unique (project_id, student_id)
);

alter table public.project_reviews enable row level security;
create policy "read marketplace reviews" on public.project_reviews for select using (
  student_id = auth.uid() or is_admin() or exists (
    select 1 from public.projects p where p.id = project_reviews.project_id and p.trainer_id = auth.uid()
  )
);
create policy "buyers write their own reviews" on public.project_reviews for insert with check (
  student_id = auth.uid()
  and exists (select 1 from public.orders o where o.project_id = project_reviews.project_id and o.student_id = auth.uid() and o.status = 'paid')
);
create policy "buyers update their own reviews" on public.project_reviews for update using (student_id = auth.uid()) with check (
  student_id = auth.uid()
  and exists (select 1 from public.orders o where o.project_id = project_reviews.project_id and o.student_id = auth.uid() and o.status = 'paid')
);

-- Keep the published document snapshot private until a buyer completes payment.
create table if not exists public.project_plan_snapshots (
  project_id uuid primary key references public.projects(id) on delete cascade,
  workspace_id uuid not null unique references public.project_workspaces(id) on delete cascade,
  title text not null,
  course text not null,
  level text not null,
  sections jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.project_plan_snapshots enable row level security;
create policy "buyers read purchased business plan snapshots" on public.project_plan_snapshots for select using (
  exists (
    select 1 from public.projects p
    where p.id = project_plan_snapshots.project_id
      and (p.trainer_id = auth.uid() or is_admin()
        or exists (select 1 from public.orders o where o.project_id = p.id and o.student_id = auth.uid() and o.status = 'paid'))
  )
);

-- Expose only aggregate ratings on public marketplace cards, never reviewer identities or comments.
create or replace view public.marketplace_project_rating_stats with (security_barrier = true) as
  select r.project_id, round(avg(r.rating)::numeric, 2) as rating_average, count(*)::integer as review_count
  from public.project_reviews r
  join public.projects p on p.id = r.project_id
  where p.status = 'published'
  group by r.project_id;
grant select on public.marketplace_project_rating_stats to anon, authenticated;
