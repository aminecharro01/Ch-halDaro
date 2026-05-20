-- DEPRECATED: use 000_initial_schema.sql instead (full setup in one file).
-- This file only adds admin columns if you already had base tables from an older install.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- Re-run policies from 000_initial_schema.sql if needed.
