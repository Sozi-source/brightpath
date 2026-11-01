-- Text-anchored supervisor feedback with auditable student/supervisor replies.
create unique index if not exists idx_workspace_sections_id_workspace_key
  on public.workspace_sections (id, workspace_id, section_key);

create table if not exists public.section_review_threads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.project_workspaces(id) on delete cascade,
  section_id uuid not null references public.workspace_sections(id) on delete cascade,
  section_key text not null,
  author_id uuid not null references public.profiles(id),
  quoted_text text not null check (char_length(trim(quoted_text)) between 1 and 1000),
  context_before text not null default '' check (char_length(context_before) <= 160),
  context_after text not null default '' check (char_length(context_after) <= 160),
  section_updated_at timestamptz not null,
  kind text not null check (kind in ('correction', 'evidence', 'question', 'structure')),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  suggested_text text check (suggested_text is null or char_length(suggested_text) <= 5000),
  status text not null default 'open' check (status in ('open', 'answered', 'resolved')),
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint section_review_thread_resolution_consistent check (
    (status = 'resolved' and resolved_by is not null and resolved_at is not null)
    or (status <> 'resolved' and resolved_by is null and resolved_at is null)
  ),
  constraint section_review_thread_section_workspace_fk
    foreign key (section_id, workspace_id, section_key)
    references public.workspace_sections(id, workspace_id, section_key)
    on delete cascade
);

create index if not exists idx_section_review_threads_workspace
  on public.section_review_threads (workspace_id, created_at desc);
create index if not exists idx_section_review_threads_section
  on public.section_review_threads (section_id, created_at);

create table if not exists public.section_review_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.section_review_threads(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists idx_section_review_replies_thread
  on public.section_review_replies (thread_id, created_at);

drop trigger if exists trg_section_review_threads_updated on public.section_review_threads;
create trigger trg_section_review_threads_updated before update on public.section_review_threads
  for each row execute function public.set_updated_at();

create or replace function public.guard_section_review_thread_update() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.workspace_id is distinct from old.workspace_id
     or new.section_id is distinct from old.section_id
     or new.section_key is distinct from old.section_key
     or new.author_id is distinct from old.author_id
     or new.quoted_text is distinct from old.quoted_text
     or new.context_before is distinct from old.context_before
     or new.context_after is distinct from old.context_after
     or new.section_updated_at is distinct from old.section_updated_at
     or new.kind is distinct from old.kind
     or new.body is distinct from old.body
     or new.suggested_text is distinct from old.suggested_text
     or new.created_at is distinct from old.created_at then
    raise exception 'Review comment content and anchors are immutable.';
  end if;
  if auth.uid() is not null and new.status = 'answered'
     and exists (select 1 from public.project_workspaces w where w.id = old.workspace_id and w.student_id = auth.uid())
     and not exists (select 1 from public.section_review_replies r where r.thread_id = old.id
       and r.author_id = auth.uid() and r.created_at >= old.updated_at) then
    raise exception 'A candidate reply is required before marking a comment answered.';
  end if;
  if auth.uid() is not null and new.status = 'resolved' and new.resolved_by is distinct from auth.uid() then
    raise exception 'The supervisor resolving a comment must be recorded as its resolver.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_section_review_thread on public.section_review_threads;
create trigger trg_guard_section_review_thread before update on public.section_review_threads
  for each row execute function public.guard_section_review_thread_update();

alter table public.section_review_threads enable row level security;
alter table public.section_review_replies enable row level security;

drop policy if exists "section review threads read workspace" on public.section_review_threads;
create policy "section review threads read workspace" on public.section_review_threads for select using (
  exists (select 1 from public.project_workspaces w where w.id = workspace_id
    and (w.student_id = auth.uid() or w.supervisor_id = auth.uid() or public.is_admin()))
);

drop policy if exists "section review threads supervisor create" on public.section_review_threads;
create policy "section review threads supervisor create" on public.section_review_threads for insert with check (
  author_id = auth.uid() and exists (select 1 from public.project_workspaces w where w.id = workspace_id
    and (w.supervisor_id = auth.uid() or public.is_admin()) and w.status <> 'closed' and w.final_project_status <> 'approved')
);

drop policy if exists "section review threads supervisor update" on public.section_review_threads;
create policy "section review threads supervisor update" on public.section_review_threads for update
  using (exists (select 1 from public.project_workspaces w where w.id = workspace_id
    and (w.supervisor_id = auth.uid() or public.is_admin()) and w.status <> 'closed' and w.final_project_status <> 'approved'))
  with check (exists (select 1 from public.project_workspaces w where w.id = workspace_id
    and (w.supervisor_id = auth.uid() or public.is_admin()) and w.status <> 'closed' and w.final_project_status <> 'approved'));

drop policy if exists "section review threads student answers" on public.section_review_threads;
create policy "section review threads student answers" on public.section_review_threads for update
  using (status <> 'resolved' and exists (select 1 from public.project_workspaces w
    where w.id = workspace_id and w.student_id = auth.uid() and w.status <> 'closed' and w.final_project_status <> 'approved'))
  with check (status = 'answered' and resolved_by is null and resolved_at is null
    and exists (select 1 from public.project_workspaces w where w.id = workspace_id and w.student_id = auth.uid()
      and w.status <> 'closed' and w.final_project_status <> 'approved'));

drop policy if exists "section review replies read workspace" on public.section_review_replies;
create policy "section review replies read workspace" on public.section_review_replies for select using (
  exists (select 1 from public.section_review_threads t join public.project_workspaces w on w.id = t.workspace_id
    where t.id = thread_id and (w.student_id = auth.uid() or w.supervisor_id = auth.uid() or public.is_admin()))
);

drop policy if exists "section review replies workspace members create" on public.section_review_replies;
create policy "section review replies workspace members create" on public.section_review_replies for insert with check (
  author_id = auth.uid() and exists (select 1 from public.section_review_threads t
    join public.project_workspaces w on w.id = t.workspace_id
    where t.id = thread_id and t.status <> 'resolved' and w.status <> 'closed' and w.final_project_status <> 'approved'
      and (w.student_id = auth.uid() or w.supervisor_id = auth.uid() or public.is_admin()))
);
