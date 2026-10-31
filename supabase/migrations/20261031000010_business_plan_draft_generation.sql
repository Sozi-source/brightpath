alter table public.section_versions
  drop constraint if exists section_versions_source_check;

alter table public.section_versions
  add constraint section_versions_source_check
  check (source in ('student_typed', 'student_accepted_suggestion', 'ai_generated_draft'));

create or replace function public.fill_empty_business_plan_sections(
  p_workspace_id uuid,
  p_user_id uuid,
  p_sections jsonb
)
returns table(generated_sections integer, preserved_sections integer)
language plpgsql
set search_path = public
as $$
declare
  item jsonb;
  section_id uuid;
  generated_count integer := 0;
  preserved_count integer := 0;
  current_user_role text := auth.role();
begin
  if coalesce(current_user_role, '') <> 'service_role' and auth.uid() is distinct from p_user_id then
    raise exception 'Unauthorized';
  end if;

  if not exists (
    select 1 from public.project_workspaces w
    where w.id = p_workspace_id
      and w.student_id = p_user_id
      and w.workspace_type = 'business_plan'
      and w.status in ('approved', 'submitted')
  ) then
    raise exception 'Business plan must be approved before it can be generated';
  end if;

  for item in select value from jsonb_array_elements(p_sections)
  loop
    insert into public.workspace_sections as existing (
      workspace_id, section_key, phase, position, current_text, status
    ) values (
      p_workspace_id,
      item->>'section_key',
      'project',
      coalesce((item->>'position')::integer, 0),
      item->>'current_text',
      'draft'
    )
    on conflict (workspace_id, section_key) do update
      set current_text = excluded.current_text,
          status = 'draft'
      where btrim(existing.current_text) = ''
         or (
           coalesce(item->>'starter_text', '') <> ''
           and existing.current_text = item->>'starter_text'
         )
    returning id into section_id;

    if section_id is not null then
      insert into public.section_versions(section_id, text, source, ai_chars_accepted)
      values (section_id, item->>'current_text', 'ai_generated_draft', 0);
      generated_count := generated_count + 1;
      section_id := null;
    else
      preserved_count := preserved_count + 1;
    end if;
  end loop;

  return query select generated_count, preserved_count;
end;
$$;

revoke all on function public.fill_empty_business_plan_sections(uuid, uuid, jsonb) from public;
grant execute on function public.fill_empty_business_plan_sections(uuid, uuid, jsonb) to authenticated, service_role;
