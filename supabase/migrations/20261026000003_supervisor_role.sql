-- Migration: 20261026000003_supervisor_role.sql
-- Adds 'supervisor' to user_role enum
alter type user_role add value if not exists 'supervisor';
