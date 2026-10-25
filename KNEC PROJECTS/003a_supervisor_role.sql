-- 003a_supervisor_role.sql
-- RUN THIS ALONE FIRST (its own execution). A new enum value cannot be used
-- in the same transaction that adds it, so keep it out of 003_project_studio.sql.
alter type user_role add value if not exists 'supervisor';
