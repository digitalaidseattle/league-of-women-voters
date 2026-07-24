CREATE TABLE IF NOT EXISTS public."Preferences"(
  id uuid primary key default gen_random_uuid(),
  biennium text not null default '2025-26',
  bills jsonb not null default '[]' ::jsonb,
  user_id uuid not null references auth.users(id) on delete cascade,
  username text unique,
  created_at timestamp with time zone not null default now()
) TABLESPACE pg_default;

