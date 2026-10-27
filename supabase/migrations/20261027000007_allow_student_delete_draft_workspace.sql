-- Allow students to delete their own draft (unapproved) project workspaces
drop policy if exists "ws delete admin" on public.project_workspaces;
drop policy if exists "ws delete student draft or admin" on public.project_workspaces;

create policy "ws delete student draft or admin"
  on public.project_workspaces
  for delete
  using (
    (student_id = auth.uid() and status in ('ideation', 'proposal_pending'))
    or public.is_admin()
  );
