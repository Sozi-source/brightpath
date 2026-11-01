alter table public.projects
  add column if not exists material_type text not null default 'technical_project'
    check (material_type in (
      'lecture_notes', 'past_paper', 'study_guide', 'reference_book',
      'business_plan', 'technical_project', 'research_project', 'other'
    )),
  add column if not exists cover_path text;

update public.projects
set material_type = 'business_plan'
where file_path like 'workspace-export:%';

create index if not exists idx_projects_published_material_type
  on public.projects(material_type, created_at desc)
  where status = 'published';

-- The sample PDF and cover image use private storage and short-lived signed URLs.
insert into storage.buckets (id, name, public, file_size_limit)
values ('project-files', 'project-files', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

-- Expose buyer comments without reviewer identities or purchase records.
create or replace view public.marketplace_project_public_reviews with (security_barrier = true) as
  select r.project_id, r.rating, r.comment, r.created_at
  from public.project_reviews r
  join public.projects p on p.id = r.project_id
  where p.status = 'published' and char_length(trim(r.comment)) > 0;

grant select on public.marketplace_project_public_reviews to anon, authenticated;
