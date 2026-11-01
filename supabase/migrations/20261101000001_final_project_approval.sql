alter table public.project_workspaces
  add column if not exists final_project_status text not null default 'not_submitted'
    check (final_project_status in ('not_submitted', 'pending_review', 'approved', 'changes_requested')),
  add column if not exists final_project_submitted_at timestamptz,
  add column if not exists final_project_approved_at timestamptz,
  add column if not exists marketplace_price_kes numeric(10, 2)
    check (marketplace_price_kes is null or marketplace_price_kes between 0 and 1000000);

alter table public.supervisor_reviews
  add column if not exists review_stage text not null default 'topic_or_chapters'
    check (review_stage in ('topic_or_chapters', 'final_project'));

-- Legacy topic-approved listings are private until they receive final project approval.
update public.projects p
set status = 'draft'
where p.file_path like 'workspace-export:%'
  and p.status in ('pending_review', 'published');

create index if not exists idx_project_workspaces_final_review
  on public.project_workspaces(final_project_status, updated_at desc);

create or replace function public.guard_workspace_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare privileged boolean;
begin
  if auth.uid() is null then return new; end if;
  privileged := public.is_admin() or auth.uid() = old.supervisor_id;

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
    if new.final_project_status is distinct from old.final_project_status
       and not (new.final_project_status = 'pending_review'
         and old.final_project_status in ('not_submitted', 'changes_requested')) then
      raise exception 'Only the student may submit a completed project for final review.';
    end if;
    if new.final_project_approved_at is distinct from old.final_project_approved_at then
      raise exception 'Final approval timestamps are set by a supervisor.';
    end if;
    if new.final_project_submitted_at is distinct from old.final_project_submitted_at then
      raise exception 'Final submission timestamps are set by the system.';
    end if;
    if new.marketplace_price_kes is distinct from old.marketplace_price_kes
       and not (new.final_project_status = 'pending_review'
         and old.final_project_status in ('not_submitted', 'changes_requested')) then
      raise exception 'Marketplace price can only be set when submitting for final review.';
    end if;
  end if;

  if new.status = 'approved' and old.status <> 'approved' then new.approved_at := now(); end if;
  if new.status = 'submitted' and old.status <> 'submitted' then new.submitted_at := now(); end if;
  if new.final_project_status = 'approved' and old.final_project_status <> 'approved' then
    new.final_project_approved_at := now();
  elsif new.final_project_status <> 'approved' then
    new.final_project_approved_at := null;
  end if;
  if new.final_project_status = 'pending_review' and old.final_project_status <> 'pending_review' then
    new.final_project_submitted_at := now();
  end if;
  return new;
end;
$$;

create or replace function public.guard_final_project_sections()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare target_workspace_id uuid;
begin
  if tg_op = 'DELETE' then
    target_workspace_id := old.workspace_id;
  else
    target_workspace_id := new.workspace_id;
  end if;
  if exists (
    select 1 from public.project_workspaces w
    where w.id = target_workspace_id
      and w.final_project_status in ('pending_review', 'approved')
  ) then
    raise exception 'Project sections are locked during final review and after final approval.';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_final_project_sections on public.workspace_sections;
create trigger trg_guard_final_project_sections
before insert or update or delete on public.workspace_sections
for each row execute function public.guard_final_project_sections();
