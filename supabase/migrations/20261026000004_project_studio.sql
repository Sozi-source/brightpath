-- Migration: 20261026000004_project_studio.sql
-- Project Studio: guided, student-authored KNEC project workspaces with AI coaching,
-- supervisor review, source-logged data, auto-generated Annex 12 log, and module access.

-- ---------- Enums ----------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'ai_mode') then
    create type ai_mode as enum ('off', 'feedback_only', 'feedback_and_polish');
  end if;
  if not exists (select 1 from pg_type where typname = 'workspace_type') then
    create type workspace_type as enum ('trade_fabrication', 'research_secondary', 'business_plan');
  end if;
  if not exists (select 1 from pg_type where typname = 'workspace_level') then
    create type workspace_level as enum ('craft', 'diploma', 'higher_diploma');
  end if;
  if not exists (select 1 from pg_type where typname = 'workspace_status') then
    create type workspace_status as enum ('ideation', 'proposal_pending', 'approved', 'submitted', 'closed');
  end if;
  if not exists (select 1 from pg_type where typname = 'section_phase') then
    create type section_phase as enum ('proposal', 'project');
  end if;
  if not exists (select 1 from pg_type where typname = 'section_status') then
    create type section_status as enum ('empty', 'draft', 'reviewed', 'final');
  end if;
  if not exists (select 1 from pg_type where typname = 'ai_event_kind') then
    create type ai_event_kind as enum (
      'coach_question', 'rubric_feedback', 'language_suggestion',
      'example_other_topic', 'mock_defence', 'reference_check', 'topic_suggestions');
  end if;
  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type review_status as enum ('approved', 'changes_requested', 'comment');
  end if;
end $$;

-- ---------- Institutions and profile extensions ----------
create table if not exists institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  ai_mode ai_mode not null default 'feedback_and_polish',
  created_at timestamptz default now()
);

alter table profiles add column if not exists admission_number text;
alter table profiles add column if not exists institution_id uuid references institutions(id);

-- ---------- Helper functions ----------
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Topic bank ----------
create table if not exists topic_bank (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  title text not null,
  workspace_type workspace_type not null,
  suggested_indicators text,
  suggested_sources text,
  course_tags text[],
  active boolean not null default true
);

-- ---------- Workspaces ----------
create table if not exists project_workspaces (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  supervisor_id uuid references profiles(id),
  institution_id uuid references institutions(id),
  workspace_type workspace_type not null,
  level workspace_level not null,
  course text not null,
  title text,
  problem_area text,
  status workspace_status not null default 'ideation',
  approved_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_project_workspaces_student on project_workspaces (student_id);
create index if not exists idx_project_workspaces_supervisor on project_workspaces (supervisor_id);

drop trigger if exists trg_workspaces_updated on project_workspaces;
create trigger trg_workspaces_updated before update on project_workspaces
  for each row execute function set_updated_at();

-- SECURITY DEFINER avoids RLS recursion between profiles and project_workspaces policies.
create or replace function is_supervisor_of_student(student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from project_workspaces w
                 where w.student_id = student and w.supervisor_id = auth.uid());
$$;

-- Students may only make permitted status transitions; approval belongs to the supervisor/admin.
create or replace function guard_workspace_update() returns trigger language plpgsql as $$
declare privileged boolean;
begin
  if auth.uid() is null then return new; end if;  -- service role / server jobs
  privileged := is_admin() or auth.uid() = old.supervisor_id;
  if not privileged then
    if new.status is distinct from old.status and not (
         (old.status = 'ideation' and new.status = 'proposal_pending')
      or (old.status = 'proposal_pending' and new.status = 'ideation')
      or (old.status = 'approved' and new.status = 'submitted')) then
      raise exception 'Only a supervisor or admin can make this status change.';
    end if;
    if new.approved_at is distinct from old.approved_at then
      raise exception 'approved_at is set by the supervisor.';
    end if;
    if old.status in ('approved', 'submitted', 'closed') and new.supervisor_id is distinct from old.supervisor_id then
      raise exception 'Supervisor cannot be changed after approval.';
    end if;
  end if;
  if new.status = 'approved' and old.status <> 'approved' then new.approved_at := now(); end if;
  if new.status = 'submitted' and old.status <> 'submitted' then new.submitted_at := now(); end if;
  return new;
end; $$;

drop trigger if exists trg_guard_workspace on project_workspaces;
create trigger trg_guard_workspace before update on project_workspaces
  for each row execute function guard_workspace_update();

-- ---------- Sections (text written by the student) ----------
create table if not exists workspace_sections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references project_workspaces(id) on delete cascade,
  section_key text not null,
  phase section_phase not null,
  position int not null default 0,
  current_text text not null default '',
  status section_status not null default 'empty',
  ai_accepted_chars int not null default 0,
  updated_at timestamptz default now(),
  unique (workspace_id, section_key)
);

create index if not exists idx_workspace_sections_workspace on workspace_sections (workspace_id);

drop trigger if exists trg_sections_updated on workspace_sections;
create trigger trg_sections_updated before update on workspace_sections
  for each row execute function set_updated_at();

-- Immutable history of each save
create table if not exists section_versions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references workspace_sections(id) on delete cascade,
  text text not null,
  source text not null check (source in ('student_typed', 'student_accepted_suggestion')),
  ai_chars_accepted int not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_section_versions_section on section_versions (section_id, created_at desc);

-- ---------- AI audit trail (written server-side only) ----------
create table if not exists ai_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references project_workspaces(id) on delete cascade,
  section_id uuid references workspace_sections(id) on delete set null,
  user_id uuid not null references profiles(id),
  kind ai_event_kind not null,
  student_input text,
  response jsonb not null,
  suggestions_accepted int not null default 0,
  suggestions_total int not null default 0,
  model text,
  tokens_in int,
  tokens_out int,
  created_at timestamptz default now()
);

create index if not exists idx_ai_events_workspace on ai_events (workspace_id, created_at desc);
create index if not exists idx_ai_events_user on ai_events (user_id, created_at desc);

-- ---------- Research data points with mandatory sources ----------
create table if not exists data_points (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references project_workspaces(id) on delete cascade,
  indicator text not null,
  value numeric not null,
  unit text not null default '%',
  survey_year int not null,
  source_title text not null,
  source_publisher text not null,
  source_location text not null,
  source_url text not null,
  accessed_on date not null,
  verified_against_original boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists idx_data_points_workspace on data_points (workspace_id);

-- ---------- Project log (Annex 12 draft) ----------
create table if not exists project_log_entries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references project_workspaces(id) on delete cascade,
  entry_date date not null default current_date,
  activity text not null,
  problems text,
  supervisor_comment text,
  auto_generated boolean not null default false,
  student_signed_at timestamptz,
  supervisor_signed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_project_log_entries_workspace on project_log_entries (workspace_id, entry_date);

create or replace function guard_log_update() returns trigger language plpgsql as $$
begin
  if auth.uid() is null then return new; end if;
  if not (is_admin() or exists (select 1 from project_workspaces w where w.id = old.workspace_id and w.supervisor_id = auth.uid())) then
    if new.supervisor_signed_at is distinct from old.supervisor_signed_at
       or new.supervisor_comment is distinct from old.supervisor_comment then
      raise exception 'Only the supervisor can sign or comment on a log entry.';
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists trg_guard_log on project_log_entries;
create trigger trg_guard_log before update on project_log_entries
  for each row execute function guard_log_update();

-- ---------- Supervisor reviews ----------
create table if not exists supervisor_reviews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references project_workspaces(id) on delete cascade,
  section_id uuid references workspace_sections(id) on delete set null,
  supervisor_id uuid not null references profiles(id),
  status review_status not null default 'comment',
  comment text not null,
  created_at timestamptz default now()
);

create index if not exists idx_supervisor_reviews_workspace on supervisor_reviews (workspace_id, created_at desc);

-- ---------- Module access (gating for online curriculum guides) ----------
create table if not exists module_access (
  user_id uuid not null references profiles(id) on delete cascade,
  module_id uuid not null references modules(id) on delete cascade,
  granted_by text not null default 'purchase',
  created_at timestamptz default now(),
  primary key (user_id, module_id)
);

-- ---------- Row-Level Security ----------
alter table institutions enable row level security;
alter table topic_bank enable row level security;
alter table project_workspaces enable row level security;
alter table workspace_sections enable row level security;
alter table section_versions enable row level security;
alter table ai_events enable row level security;
alter table data_points enable row level security;
alter table project_log_entries enable row level security;
alter table supervisor_reviews enable row level security;
alter table module_access enable row level security;

-- Institutions policies
drop policy if exists "signed-in read institutions" on institutions;
create policy "signed-in read institutions" on institutions for select using (auth.uid() is not null);

drop policy if exists "admin manages institutions" on institutions;
create policy "admin manages institutions" on institutions for all using (is_admin());

-- Topic bank policies
drop policy if exists "signed-in read topics" on topic_bank;
create policy "signed-in read topics" on topic_bank for select using (active and auth.uid() is not null);

drop policy if exists "admin manages topics" on topic_bank;
create policy "admin manages topics" on topic_bank for all using (is_admin());

-- Profiles policy: supervisor reads their own students
drop policy if exists "supervisor reads own students" on profiles;
create policy "supervisor reads own students" on profiles for select using (is_supervisor_of_student(id));

-- Workspaces policies
drop policy if exists "ws select" on project_workspaces;
create policy "ws select" on project_workspaces for select
  using (student_id = auth.uid() or supervisor_id = auth.uid() or is_admin());

drop policy if exists "ws insert" on project_workspaces;
create policy "ws insert" on project_workspaces for insert with check (student_id = auth.uid() and status = 'ideation');

drop policy if exists "ws update" on project_workspaces;
create policy "ws update" on project_workspaces for update
  using (student_id = auth.uid() or supervisor_id = auth.uid() or is_admin());

drop policy if exists "ws delete admin" on project_workspaces;
create policy "ws delete admin" on project_workspaces for delete using (is_admin());

-- Sections policies
drop policy if exists "sections select" on workspace_sections;
create policy "sections select" on workspace_sections for select using (
  exists (select 1 from project_workspaces w where w.id = workspace_id
          and (w.student_id = auth.uid() or w.supervisor_id = auth.uid() or is_admin())));

drop policy if exists "sections student insert" on workspace_sections;
create policy "sections student insert" on workspace_sections for insert with check (
  exists (select 1 from project_workspaces w where w.id = workspace_id and w.student_id = auth.uid()
          and (phase = 'proposal' or w.status = 'approved')));

drop policy if exists "sections student update" on workspace_sections;
create policy "sections student update" on workspace_sections for update using (
  exists (select 1 from project_workspaces w where w.id = workspace_id and w.student_id = auth.uid()
          and (phase = 'proposal' or w.status = 'approved')));

-- Versions policies
drop policy if exists "versions select" on section_versions;
create policy "versions select" on section_versions for select using (
  exists (select 1 from workspace_sections s join project_workspaces w on w.id = s.workspace_id
          where s.id = section_id and (w.student_id = auth.uid() or w.supervisor_id = auth.uid() or is_admin())));

drop policy if exists "versions student insert" on section_versions;
create policy "versions student insert" on section_versions for insert with check (
  exists (select 1 from workspace_sections s join project_workspaces w on w.id = s.workspace_id
          where s.id = section_id and w.student_id = auth.uid()));

-- AI events policy
drop policy if exists "ai events select" on ai_events;
create policy "ai events select" on ai_events for select using (
  exists (select 1 from project_workspaces w where w.id = workspace_id
          and (w.student_id = auth.uid() or w.supervisor_id = auth.uid() or is_admin())));

-- Data points policies
drop policy if exists "data select" on data_points;
create policy "data select" on data_points for select using (
  exists (select 1 from project_workspaces w where w.id = workspace_id
          and (w.student_id = auth.uid() or w.supervisor_id = auth.uid() or is_admin())));

drop policy if exists "data student write" on data_points;
create policy "data student write" on data_points for all
  using (exists (select 1 from project_workspaces w where w.id = workspace_id and w.student_id = auth.uid() and w.status = 'approved'))
  with check (exists (select 1 from project_workspaces w where w.id = workspace_id and w.student_id = auth.uid() and w.status = 'approved'));

-- Log entries policies
drop policy if exists "log select" on project_log_entries;
create policy "log select" on project_log_entries for select using (
  exists (select 1 from project_workspaces w where w.id = workspace_id
          and (w.student_id = auth.uid() or w.supervisor_id = auth.uid() or is_admin())));

drop policy if exists "log student insert" on project_log_entries;
create policy "log student insert" on project_log_entries for insert with check (
  exists (select 1 from project_workspaces w where w.id = workspace_id and w.student_id = auth.uid()));

drop policy if exists "log update" on project_log_entries;
create policy "log update" on project_log_entries for update using (
  exists (select 1 from project_workspaces w where w.id = workspace_id
          and (w.student_id = auth.uid() or w.supervisor_id = auth.uid() or is_admin())));

-- Supervisor reviews policies
drop policy if exists "reviews select" on supervisor_reviews;
create policy "reviews select" on supervisor_reviews for select using (
  exists (select 1 from project_workspaces w where w.id = workspace_id
          and (w.student_id = auth.uid() or w.supervisor_id = auth.uid() or is_admin())));

drop policy if exists "reviews supervisor insert" on supervisor_reviews;
create policy "reviews supervisor insert" on supervisor_reviews for insert with check (
  supervisor_id = auth.uid() and exists (select 1 from project_workspaces w
          where w.id = workspace_id and (w.supervisor_id = auth.uid() or is_admin())));

-- Module access policies
drop policy if exists "own module access" on module_access;
create policy "own module access" on module_access for select using (user_id = auth.uid() or is_admin());

drop policy if exists "admin manages module access" on module_access;
create policy "admin manages module access" on module_access for all using (is_admin());
