-- Migration: Fix workspace_sections RLS insert policy
-- Allow candidates to initialize section checklist for their own workspace regardless of initial ideation status

drop policy if exists "sections student insert" on workspace_sections;
create policy "sections student insert" on workspace_sections for insert with check (
  exists (
    select 1 from project_workspaces w
    where w.id = workspace_id
      and w.student_id = auth.uid()
  )
);
