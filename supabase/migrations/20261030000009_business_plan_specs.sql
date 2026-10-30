alter table public.project_workspaces
  add column if not exists business_plan_specs jsonb;

comment on column public.project_workspaces.business_plan_specs is
  'Candidate-entered business plan details used for guided drafting and document export.';
