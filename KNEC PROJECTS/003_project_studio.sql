-- 003_project_studio.sql
-- Project Studio: guided, student-authored KNEC project workspaces with AI coaching,
-- supervisor review, source-logged data and an auto-generated Annex 12 log.
-- Prerequisite: schema.sql, 002_auth_and_security.sql and 003a_supervisor_role.sql already run.
-- Design rule: the AI never inserts text into a student's work by itself. All AI output
-- is stored in ai_events; text only enters a section when the student types it or
-- explicitly accepts a suggestion (recorded in section_versions.ai_chars_accepted).

-- ---------- Enums ----------
create type ai_mode as enum ('off', 'feedback_only', 'feedback_and_polish');
create type workspace_type as enum ('trade_fabrication', 'research_secondary', 'business_plan');
create type workspace_level as enum ('craft', 'diploma', 'higher_diploma');
create type workspace_status as enum ('ideation', 'proposal_pending', 'approved', 'submitted', 'closed');
create type section_phase as enum ('proposal', 'project');
create type section_status as enum ('empty', 'draft', 'reviewed', 'final');
create type ai_event_kind as enum (
  'coach_question', 'rubric_feedback', 'language_suggestion',
  'example_other_topic', 'mock_defence', 'reference_check', 'topic_suggestions');
create type review_status as enum ('approved', 'changes_requested', 'comment');

-- ---------- Institutions and profile extensions ----------
create table institutions (
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
begin new.updated_at = now(); return new; end; $$;

-- ---------- Topic bank (seed from Kit 02 topic bank) ----------
create table topic_bank (
  id uuid primary key default gen_random_uuid(),
  area text not null,                 -- e.g. 'Child malnutrition'
  title text not null,                -- a starting idea, to be narrowed by the student
  workspace_type workspace_type not null,
  suggested_indicators text,
  suggested_sources text,
  course_tags text[],
  active boolean not null default true
);

-- ---------- Workspaces ----------
create table project_workspaces (
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
create index on project_workspaces (student_id);
create index on project_workspaces (supervisor_id);
create trigger trg_workspaces_updated before update on project_workspaces
  for each row execute function set_updated_at();

-- SECURITY DEFINER avoids RLS recursion between profiles and project_workspaces policies.
create or replace function is_supervisor_of_student(student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from project_workspaces w
                 where w.student_id = student and w.supervisor_id = auth.uid());
$$;

-- Students may only make the permitted status transitions; approval belongs to the supervisor/admin.
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
create trigger trg_guard_workspace before update on project_workspaces
  for each row execute function guard_workspace_update();

-- ---------- Sections (text written by the student) ----------
create table workspace_sections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references project_workspaces(id) on delete cascade,
  section_key text not null,          -- e.g. 'ch1.problem' (see AGENT_CONTEXT.md)
  phase section_phase not null,
  position int not null default 0,
  current_text text not null default '',
  status section_status not null default 'empty',
  ai_accepted_chars int not null default 0,   -- cumulative chars the student accepted from AI suggestions
  updated_at timestamptz default now(),
  unique (workspace_id, section_key)
);
create index on workspace_sections (workspace_id);
create trigger trg_sections_updated before update on workspace_sections
  for each row execute function set_updated_at();

-- Immutable history of each save
create table section_versions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references workspace_sections(id) on delete cascade,
  text text not null,
  source text not null check (source in ('student_typed', 'student_accepted_suggestion')),
  ai_chars_accepted int not null default 0,
  created_at timestamptz default now()
);
create index on section_versions (section_id, created_at desc);

-- ---------- AI audit trail (written server-side only) ----------
create table ai_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references project_workspaces(id) on delete cascade,
  section_id uuid references workspace_sections(id) on delete set null,
  user_id uuid not null references profiles(id),
  kind ai_event_kind not null,
  student_input text,                 -- what the student sent (their own text or question)
  response jsonb not null,            -- structured AI output (questions, feedback, suggestions[])
  suggestions_accepted int not null default 0,
  suggestions_total int not null default 0,
  model text,
  tokens_in int,
  tokens_out int,
  created_at timestamptz default now()
);
create index on ai_events (workspace_id, created_at desc);
create index on ai_events (user_id, created_at desc);   -- daily rate limiting

-- ---------- Research data points with mandatory sources ----------
create table data_points (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references project_workspaces(id) on delete cascade,
  indicator text not null,
  value numeric not null,
  unit text not null default '%',
  survey_year int not null,
  source_title text not null,
  source_publisher text not null,
  source_location text not null,      -- table or page in the original report
  source_url text not null,
  accessed_on date not null,
  verified_against_original boolean not null default false,
  created_at timestamptz default now()
);
create index on data_points (workspace_id);

-- ---------- Project log (Annex 12 draft; official form still required) ----------
create table project_log_entries (
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
create index on project_log_entries (workspace_id, entry_date);

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
create trigger trg_guard_log before update on project_log_entries
  for each row execute function guard_log_update();

-- ---------- Supervisor reviews ----------
create table supervisor_reviews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references project_workspaces(id) on delete cascade,
  section_id uuid references workspace_sections(id) on delete set null,
  supervisor_id uuid not null references profiles(id),
  status review_status not null default 'comment',
  comment text not null,
  created_at timestamptz default now()
);
create index on supervisor_reviews (workspace_id, created_at desc);

-- ---------- Lesson access (gating for the online guides) ----------
create table module_access (
  user_id uuid not null references profiles(id) on delete cascade,
  module_id uuid not null references modules(id) on delete cascade,
  granted_by text not null default 'purchase',   -- 'purchase' | 'institution' | 'admin'
  created_at timestamptz default now(),
  primary key (user_id, module_id)
);

-- ---------- Row-level security ----------
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

create policy "signed-in read institutions" on institutions for select using (auth.uid() is not null);
create policy "admin manages institutions" on institutions for all using (is_admin());
create policy "signed-in read topics" on topic_bank for select using (active and auth.uid() is not null);
create policy "admin manages topics" on topic_bank for all using (is_admin());

-- Profiles: supervisors may read the students they supervise
create policy "supervisor reads own students" on profiles for select using (is_supervisor_of_student(id));

-- Workspaces
create policy "ws select" on project_workspaces for select
  using (student_id = auth.uid() or supervisor_id = auth.uid() or is_admin());
create policy "ws insert" on project_workspaces for insert with check (student_id = auth.uid() and status = 'ideation');
create policy "ws update" on project_workspaces for update
  using (student_id = auth.uid() or supervisor_id = auth.uid() or is_admin());
create policy "ws delete admin" on project_workspaces for delete using (is_admin());

-- Reusable predicate pattern for child tables: caller can see the parent workspace
-- Sections: student writes (proposal sections any time; project sections only after approval)
create policy "sections select" on workspace_sections for select using (
  exists (select 1 from project_workspaces w where w.id = workspace_id
          and (w.student_id = auth.uid() or w.supervisor_id = auth.uid() or is_admin())));
create policy "sections student insert" on workspace_sections for insert with check (
  exists (select 1 from project_workspaces w where w.id = workspace_id and w.student_id = auth.uid()
          and (phase = 'proposal' or w.status = 'approved')));
create policy "sections student update" on workspace_sections for update using (
  exists (select 1 from project_workspaces w where w.id = workspace_id and w.student_id = auth.uid()
          and (phase = 'proposal' or w.status = 'approved')));

create policy "versions select" on section_versions for select using (
  exists (select 1 from workspace_sections s join project_workspaces w on w.id = s.workspace_id
          where s.id = section_id and (w.student_id = auth.uid() or w.supervisor_id = auth.uid() or is_admin())));
create policy "versions student insert" on section_versions for insert with check (
  exists (select 1 from workspace_sections s join project_workspaces w on w.id = s.workspace_id
          where s.id = section_id and w.student_id = auth.uid()));
-- no update/delete policies: history is immutable

-- AI events: read-only for users; inserts and acceptance counts are written with the service role
create policy "ai events select" on ai_events for select using (
  exists (select 1 from project_workspaces w where w.id = workspace_id
          and (w.student_id = auth.uid() or w.supervisor_id = auth.uid() or is_admin())));

-- Data points: student manages own; supervisor/admin read
create policy "data select" on data_points for select using (
  exists (select 1 from project_workspaces w where w.id = workspace_id
          and (w.student_id = auth.uid() or w.supervisor_id = auth.uid() or is_admin())));
create policy "data student write" on data_points for all
  using (exists (select 1 from project_workspaces w where w.id = workspace_id and w.student_id = auth.uid() and w.status = 'approved'))
  with check (exists (select 1 from project_workspaces w where w.id = workspace_id and w.student_id = auth.uid() and w.status = 'approved'));

-- Log entries
create policy "log select" on project_log_entries for select using (
  exists (select 1 from project_workspaces w where w.id = workspace_id
          and (w.student_id = auth.uid() or w.supervisor_id = auth.uid() or is_admin())));
create policy "log student insert" on project_log_entries for insert with check (
  exists (select 1 from project_workspaces w where w.id = workspace_id and w.student_id = auth.uid()));
create policy "log update" on project_log_entries for update using (
  exists (select 1 from project_workspaces w where w.id = workspace_id
          and (w.student_id = auth.uid() or w.supervisor_id = auth.uid() or is_admin())));

-- Supervisor reviews
create policy "reviews select" on supervisor_reviews for select using (
  exists (select 1 from project_workspaces w where w.id = workspace_id
          and (w.student_id = auth.uid() or w.supervisor_id = auth.uid() or is_admin())));
create policy "reviews supervisor insert" on supervisor_reviews for insert with check (
  supervisor_id = auth.uid() and exists (select 1 from project_workspaces w
          where w.id = workspace_id and (w.supervisor_id = auth.uid() or is_admin())));

-- Module access: users read their own; grants are written server-side
create policy "own module access" on module_access for select using (user_id = auth.uid() or is_admin());
