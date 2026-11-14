-- Create trainer applications as pending supervisor accounts.
-- Student signups continue to create student profiles immediately.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data->>'requested_role';
  profile_role user_role := case
    when requested_role = 'supervisor' then 'supervisor'::user_role
    else 'student'::user_role
  end;
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    profile_role
  )
  on conflict (id) do nothing;

  if requested_role = 'supervisor' then
    insert into public.trainer_profiles (user_id, status)
    values (new.id, 'pending')
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;
