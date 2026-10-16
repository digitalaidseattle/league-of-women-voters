-- Row Level Security for Preferences.
-- Apply after 000007. Keeps each user scoped to their own row while leaving the
-- global/default row (user_id is null) readable by the anon role the edge
-- functions use to read the current biennium.
alter table public."Preferences" enable row level security;

create policy "Users can read own preferences"
  on public."Preferences" for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public."Preferences" for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public."Preferences" for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- The global/default row is readable by everyone (incl. the edge functions' anon role).
create policy "Anyone can read the global preference"
  on public."Preferences" for select
  to anon, authenticated
  using (user_id is null);
