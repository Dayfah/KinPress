# KinPress — Vercel environment checklist

Set these in **Vercel → Project → Settings → Environment Variables** for **Production** (and **Preview** if you test PRs).

## Required (client-safe — `NEXT_PUBLIC_*`)

| Variable | Production value | Notes |
|----------|------------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kfpaevryzgnjllqaihtf.supabase.co` | Full `https://` URL ending in `.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ…` (anon JWT) | **Or** use publishable key below |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` | Preferred; only one key type required |
| `NEXT_PUBLIC_SITE_URL` | `https://kin-press.vercel.app` | Required on Vercel builds (auth redirects) |

Copy keys from **Supabase → Project Settings → API** (anon or publishable — **not** service role).

## Server-only ingestion vars

| Variable | Notes |
|----------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | Required only for `/api/ingest/*`; server-side only, no `NEXT_PUBLIC_` prefix |
| `CRON_SECRET` | Required to authorize `/api/ingest/*` and Vercel Cron calls |
| `GNEWS_API_KEY` | Optional GNews integration for curated news ingestion |
| `NEWS_API_KEY` | Optional NewsAPI integration for curated news ingestion |
| `GUARDIAN_API_KEY` | Optional Guardian Open Platform integration |
| `EVENTBRITE_API_KEY` | Optional Eventbrite event ingestion |
| `GRANTS_GOV_ENABLED` | Set `true` to enable Grants.gov opportunity ingestion |
| `KINPRESS_NEWS_RSS_FEEDS` | Optional comma-separated RSS feeds; defaults exist |
| `KINPRESS_RESOURCE_FEED_URLS` | Optional comma-separated JSON feed URLs |
| `KINPRESS_OPPORTUNITY_FEED_URLS` | Optional comma-separated JSON feed URLs |
| `KINPRESS_EVENT_FEED_URLS` | Optional comma-separated JSON feed URLs |

## Optional public/debug vars

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_ENABLE_SUPABASE_DEBUG` | `true` enables `/debug/supabase` in production |
| `SKIP_ENV_VALIDATION` | Emergency CI bypass only — **do not** set on Production |

## Do not set (unused or dangerous)

| Variable | Why |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | **Never** — exposes service role to the browser; build fails if detected |
| `ADMIN_EMAILS` | Not referenced in `src/` |

## Supabase Auth URL checklist

In **Supabase → Authentication → URL configuration**:

| Setting | Value |
|---------|--------|
| **Site URL** | `https://kin-press.vercel.app` |
| **Redirect URLs** | `https://kin-press.vercel.app/auth/callback` |
| | `http://localhost:3000/auth/callback` |

## Build validation

When `VERCEL=1`, `next build` runs `assertProductionEnvForBuild()` and **fails the deploy** if:

- `NEXT_PUBLIC_SUPABASE_URL` is missing or not a valid `https://…supabase.co` URL
- Neither publishable nor anon key is set (or key is a placeholder / service_role JWT)
- `NEXT_PUBLIC_SITE_URL` is missing
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` is set

This prevents `MIDDLEWARE_INVOCATION_FAILED` 500s from bad Supabase client construction.

## After changing env vars

1. **Redeploy** on Vercel (env changes do not apply until redeploy).
2. Confirm build log shows no env validation errors.
3. Smoke-test: `/`, `/login`, `/articles/<slug>`, `/saved`, `/resources`, `/opportunities`, `/events`, `/admin`.
4. Test ingestion with `POST /api/ingest/news` and `Authorization: Bearer <CRON_SECRET>`.

See also [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) and [VERCEL_AUDIT.md](./VERCEL_AUDIT.md).
