-- Restore read access for deployments that applied migrations 003-005 before
-- the saved_articles SELECT grant was added to those existing migration files.
grant select on table public.saved_articles to authenticated;
