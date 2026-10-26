-- =============================================================================
-- Migration: 20261026000006_fix_rls_stack_depth_54001.sql
-- Purpose: Fix PostgreSQL error 54001 ("stack depth limit exceeded") caused by
--          infinite RLS recursion in is_admin() when querying `profiles` or
--          updating `project_workspaces` via guard_workspace_update().
-- =============================================================================

-- 1. Make is_admin() SECURITY DEFINER with fixed search_path so querying `profiles`
--    inside `is_admin()` bypasses RLS on `profiles` and never recurses.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- 2. Optimize guard_workspace_update() to check student/supervisor ownership first
--    before invoking is_admin(), and run with fixed search_path.
create or replace function public.guard_workspace_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service role / backend admin calls have auth.uid() = null
  if auth.uid() is null then
    return new;
  end if;

  -- Students cannot self-approve, self-submit final, or reassign their supervisor
  if auth.uid() = old.student_id then
    if new.supervisor_id is distinct from old.supervisor_id then
      if not public.is_admin() then
        raise exception 'Students cannot reassign their supervisor.';
      end if;
    end if;

    if new.status in ('approved', 'rejected') and old.status is distinct from new.status then
      if not public.is_admin() then
        raise exception 'Only an assigned supervisor can approve or reject a workspace.';
      end if;
    end if;

    if new.approved_at is distinct from old.approved_at then
      if not public.is_admin() then
        raise exception 'Students cannot modify approval timestamps.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

-- 3. Optimize guard_log_update() similarly
create or replace function public.guard_log_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if auth.uid() = old.student_id then
    if old.verified is true then
      if not public.is_admin() then
        raise exception 'Verified log entries are immutable and cannot be edited.';
      end if;
    end if;

    if (new.verified is distinct from old.verified)
       or (new.verified_by is distinct from old.verified_by)
       or (new.verified_at is distinct from old.verified_at) then
      if not public.is_admin() then
        raise exception 'Students cannot self-verify log entries.';
      end if;
    end if;
  end if;

  return new;
end;
$$;
