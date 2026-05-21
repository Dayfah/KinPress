# KinPress Production Audit — 2026-05-17

## Build and repo status
- Local `npm run build` passes.
- Current HEAD is `cea10133b6167fff9ffe1ed5bf87e05e006229e8` (`cea1013`).
- Branch: `work`.

## Required environment variables (from code)

### Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` fallback)

### Strongly recommended
- `NEXT_PUBLIC_SITE_URL` (for auth callback origin)

### Optional server-side ingestion
- `GNEWS_API_KEY`, `NEWS_API_KEY`, `GUARDIAN_API_KEY`, `EVENTBRITE_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` are required for protected ingestion routes.

### Not used in application code
- `SUPABASE_SERVICE_ROLE_KEY` is not required by the current code paths and must remain server-only if introduced later.

## Supabase integration coverage check
- Browser client: `src/lib/supabase/client.ts`
- Server client: `src/lib/supabase/server.ts`
- Middleware client: `src/lib/supabase/middleware.ts`
- Auth callback route: `src/app/auth/callback/route.ts`
- Profile creation/sync: `src/lib/auth/profile.ts` and `src/app/api/auth/setup/route.ts`
- Saved articles: `src/components/save-article-button.tsx` and `src/lib/editorial/saved.ts`
- Admin role checks: `src/lib/auth/guards.ts`
- Admin publish flow: `src/app/admin/articles/new/page.tsx`

## Database expectations
The app uses at minimum:
- `profiles`
- `articles`
- `saved_articles`

It also expects:
- `authors`, `categories`, `comments`, `resources`, `opportunities`, `events`, `user_preferences`, `ingestion_runs`, `tags`, `article_tags`, and storage bucket `article-covers`.

## Migration status
- Existing baseline migration verified: `supabase/migrations/001_kinpress_schema.sql` (tables + RLS + `handle_new_user`).
- Added non-destructive hardening migration: `supabase/migrations/002_hardening_triggers_policies_indexes.sql`, which adds:
  - `updated_at` trigger function + triggers (`profiles`, `articles`)
  - admin/editor helper function `public.is_admin_or_editor(uuid)`
  - explicit saved article CRUD policies
  - performance indexes for article, saved, and comment queries

## Manual platform settings (if not already configured)

### Vercel env vars
- `NEXT_PUBLIC_SUPABASE_URL=https://kfpaevryzgnjllqaihtf.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>`
- `NEXT_PUBLIC_SITE_URL=https://kin-press.vercel.app`
- `CRON_SECRET=<secret>`
- `SUPABASE_SERVICE_ROLE_KEY=<server-only key>`
- Optional content API keys as documented in `.env.example`.

Do not set `SUPABASE_SERVICE_ROLE_KEY` as `NEXT_PUBLIC_*`.

### Supabase Auth URL settings
- Site URL: `https://kin-press.vercel.app`
- Redirect URLs:
  - `https://kin-press.vercel.app`
  - `https://kin-press.vercel.app/auth/callback`
  - `http://localhost:3000`
  - `http://localhost:3000/auth/callback`

## Live deployment verification limits
- This audit verifies code paths and local build/lint/typecheck.
- Vercel deployment dashboard status and live interactive E2E browser behavior require platform/browser access not available in this CLI session.
