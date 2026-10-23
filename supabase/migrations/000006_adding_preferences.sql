CREATE TABLE IF NOT EXISTS public."Preferences"(
  id uuid primary key default gen_random_uuid(),
  biennium text,
  bills text[] null,
  created_at timestamp with time zone not null default now()
) TABLESPACE pg_default;

