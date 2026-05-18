# KinPress Supabase connection audit

**Code audit:** All editorial data paths use Supabase (no mock/GNews in `src/`).  
**Service role:** Not used anywhere in application code.

## Env vars (single source: `src/lib/supabase/env.ts`)

| Variable | Client | Server | Notes |
|----------|--------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Required |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Yes | Preferred |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | Fallback if publishable unset |
| `NEXT_PUBLIC_SITE_URL` | Yes | Yes | Auth redirects |
| `SUPABASE_SERVICE_ROLE_KEY` | **Must not use** | Optional, unused | Never `NEXT_PUBLIC_*` |

## Data paths

| Feature | Table | Client file |
|---------|-------|-------------|
| Homepage / latest / topics | `articles` | `lib/editorial/articles.ts` |
| Search | `articles` | `lib/editorial/search.ts` |
| Article detail | `articles`, `comments` | `app/articles/[slug]/page.tsx` |
| Saved | `saved_articles` | `lib/editorial/saved.ts`, `save-article-button.tsx` |
| Profile | `profiles` | `app/profile/page.tsx` |
| Auth bootstrap | `profiles`, `authors` | `lib/auth/profile.ts`, `/api/auth/setup` |
| Admin publish | `articles`, storage | `app/admin/articles/new/page.tsx` |

## Debug page

- **URL:** `/debug/supabase`
- **Enabled:** `NODE_ENV=development` OR `NEXT_PUBLIC_ENABLE_SUPABASE_DEBUG=true`
- Tests env, session, articles read, saved_articles insert/delete

## Live site checklist

See [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md).
