-- 003a_supervisor_role.sql
-- RUN THIS FIRST. Adding an enum value must be executed independently.
alter type user_role add value if not exists 'supervisor';
