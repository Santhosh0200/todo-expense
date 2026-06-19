-- Fluxa V2 · Quick Capture Phase 3 · Feature 5 (Capture Source Analytics)
--
-- Adds a nullable `source` column to both tables so we can measure how many
-- records are created via Quick Capture vs. the classic forms.
--
-- Safe / non-breaking:
--   * Column is nullable with no default → existing rows stay valid (source = NULL).
--   * The app writes 'form' | 'quick_capture' going forward.
--   * Until this migration is applied, the app transparently inserts WITHOUT
--     the column (see insertRow() in src/App.tsx), so deployment stays stable
--     whether or not this has run yet.
--
-- Apply via the Supabase SQL editor or `psql`.

alter table public.expenses add column if not exists source text;
alter table public.todos    add column if not exists source text;

-- Optional: constrain to known values (kept permissive; NULL allowed for old rows).
-- alter table public.expenses add constraint expenses_source_chk
--   check (source is null or source in ('form','quick_capture'));
-- alter table public.todos add constraint todos_source_chk
--   check (source is null or source in ('form','quick_capture'));
