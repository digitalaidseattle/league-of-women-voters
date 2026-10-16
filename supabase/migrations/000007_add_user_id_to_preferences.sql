-- Associate each Preferences row with an auth user.
-- Rows with user_id = null are the global/default preference: the edge functions
-- read that row for the current biennium. Each signed-in user gets their own row.
alter table public."Preferences"
  add column if not exists user_id uuid
    references auth.users (id) on delete cascade
    default auth.uid();

-- One preference row per user. The global/default rows (user_id is null) are
-- excluded from the constraint, so there can still be a null-user global row.
create unique index if not exists preferences_user_id_key
  on public."Preferences" (user_id)
  where user_id is not null;
