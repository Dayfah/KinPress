# KinPress — Vercel deployment checklist

**Live URL:** https://kin-press.vercel.app  
**Repo:** https://github.com/Dayfah/KinPress  
**Production branch:** `main`

Use this before and after every production release.

---

## Exact Vercel project settings

Configure in **Vercel → KinPress project → Settings → General** and **Build & Deployment**.

| # | Setting | Value |
|---|---------|--------|
| 1 | **Framework Preset** | `Next.js` |
| 2 | **Build Command** | `npm run build` *(or leave blank — `vercel.json` sets this)* |
| 3 | **Install Command** | `npm install` *(or leave blank — `vercel.json` sets this)* |
| 4 | **Output Directory** | **Leave blank** (default). Do not set `.next` manually. |
| 5 | **Root Directory** | **Leave blank** (app is at repository root, not a subfolder) |
| 6 | **Node.js Version** | **22.x** (recommended) or **20.x**. Matches `package.json` `"engines": { "node": ">=20 <23" }`. |
| 7 | **Production Branch** | `main` |

### Override vs defaults

You can use **either** dashboard defaults **or** `vercel.json` — both are aligned:

| Setting | Dashboard default | This repo (`vercel.json`) |
|---------|-------------------|---------------------------|
| Framework | Next.js | `"framework": "nextjs"` |
| Install | `npm install` | `"installCommand": "npm install"` |
| Build | `npm run build` | `"buildCommand": "npm run build"` |
| Output | *(auto)* | *(not set — correct)* |

**Recommended:** Keep `vercel.json` for `NODE_OPTIONS=--max-old-space-size=8192` (avoids OOM on large Next.js builds).

---

## Environment variables (Production)

**Vercel → Settings → Environment Variables → Production** (also add to Preview if you test PRs).

| Variable | Required | Example / notes |
|----------|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | `https://kfpaevryzgnjllqaihtf.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes* | Anon JWT from Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes* | `sb_publishable_…` (preferred alternative to anon) |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | `https://kin-press.vercel.app` |
| `SUPABASE_SERVICE_ROLE_KEY` | For ingestion | Server-only Supabase service role key |
| `CRON_SECRET` | For ingestion | Shared secret for `/api/ingest/*` and Vercel Cron |

\* Set **one** of anon or publishable key (not both required).

**Do not set on Vercel:**

| Variable | Why |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | Exposes secret to browser; build fails if detected |
| `ADMIN_EMAILS` | Not referenced in `src/` |

**Optional:**

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_ENABLE_SUPABASE_DEBUG` | `true` → enables `/debug/supabase` in production |
| `GNEWS_API_KEY` | Optional curated news API ingestion |
| `NEWS_API_KEY` | Optional NewsAPI ingestion |
| `GUARDIAN_API_KEY` | Optional Guardian Open Platform ingestion |
| `EVENTBRITE_API_KEY` | Optional Eventbrite event ingestion |
| `GRANTS_GOV_ENABLED` | Optional Grants.gov opportunity ingestion |
| `KINPRESS_NEWS_RSS_FEEDS` | Optional approved RSS override |
| `KINPRESS_RESOURCE_FEED_URLS` | Optional verified resource JSON feeds |
| `KINPRESS_OPPORTUNITY_FEED_URLS` | Optional verified opportunity JSON feeds |
| `KINPRESS_EVENT_FEED_URLS` | Optional verified event JSON feeds |

On Vercel (`VERCEL=1`), `next.config.ts` runs env validation at build time — missing/invalid vars **fail the build** with a clear message instead of a runtime `MIDDLEWARE_INVOCATION_FAILED` 500.

---

## Supabase Auth URL settings

**Supabase → Authentication → URL configuration**

| Field | Value |
|-------|--------|
| **Site URL** | `https://kin-press.vercel.app` |

**Redirect URLs** (one per line):

```
https://kin-press.vercel.app
https://kin-press.vercel.app/auth/callback
http://localhost:3000
http://localhost:3000/auth/callback
```

---

## Is `vercel.json` needed?

**Yes — recommended.** Current file:

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "build": {
    "env": {
      "NODE_OPTIONS": "--max-old-space-size=8192"
    }
  }
}
```

- Documents install/build commands for the team.
- Raises Node heap for production builds (helps avoid OOM).
- Does **not** set Output Directory (correct for Next.js).

---

## Middleware & Edge Runtime

| Check | Status |
|-------|--------|
| File | `src/middleware.ts` → `updateSession` in `src/lib/supabase/middleware.ts` |
| Runtime | **Vercel Edge** (Next.js middleware default) |
| Packages | `@supabase/ssr` `createServerClient` only |
| Node-only APIs | **None** in middleware path |
| DB queries | **None** in middleware |
| Service role | **Not used** |
| Missing Supabase env | Passthrough — public pages still load |
| Static assets | Excluded via `matcher` (`_next/static`, `_next/image`, favicon, images, css, js) |

**Edge-compatible:** Yes, when the fixed middleware is deployed (see blocker below).

---

## `npm ERR_INVALID_URL` / `.npmrc`

| Check | Result |
|-------|--------|
| `.npmrc` in repo | **None** (deleted on `de11f49`) |
| Invalid registry URL | Was `registry=https://<YOUR_INTERNAL_NPM_REGISTRY>/` on older commits — **fixed** |
| `npm install` | Pass (local verify) |
| `npm run build` | Pass (local verify) |
| `package-lock.json` | Valid lockfileVersion 3, committed |

If install fails on Vercel, confirm **no** `.npmrc` exists on the deployed commit and clear **Build Cache** → Redeploy.

---

## Production 500 — `MIDDLEWARE_INVOCATION_FAILED`

### Root cause on live deploy (commit `de11f49`)

Deployed `src/middleware.ts` still contains:

```ts
await supabaseResponse.cookies; // invalid — not a Promise
```

and imports broken `@/utils/supabase/middleware` with `createServerClient(undefined, undefined)` when env vars are missing.

### Fix (must be on `main` before redeploy)

Local repo has the corrected `@supabase/ssr` middleware. **Push to `main` and redeploy:**

- [ ] Commit + push middleware/auth/env fixes
- [ ] Vercel Production env vars set (table above)
- [ ] Redeploy Production (optionally clear build cache once)
- [ ] Confirm deployment SHA ≠ `de11f49` broken middleware
- [ ] `https://kin-press.vercel.app/` returns **200**

---

## Pre-deploy (GitHub)

- [ ] Default branch: `main`
- [ ] No `.npmrc` in repo
- [ ] No `.env.local` committed (`git check-ignore .env.local`)
- [ ] `npm install` — pass
- [ ] `npm run lint` — 0 errors
- [ ] `npm run typecheck` — pass
- [ ] `npm run build` — pass
- [ ] Push to `main` triggers Vercel

## Pre-deploy (Supabase)

- [ ] Migrations 001 → 002_editorial_fields → kinpress_production_audit_fix → 003 → 004 → 005 applied
- [ ] Real articles ingested/published; optional verified starter resources seeded
- [ ] Auth Site URL + redirect URLs (above)
- [ ] At least one `profiles.role = 'admin'`
- [ ] Storage bucket `article-covers` exists

See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## Post-deploy smoke test

- [ ] `/` — loads (no 500)
- [ ] `/articles/<slug>` — no 500
- [ ] `/login`, `/signup`, sign out
- [ ] `/profile` — redirects to login when logged out
- [ ] Save / unsave → `/saved`
- [ ] `/admin` — login required; admin role on page
- [ ] Mobile nav + dark mode
- [ ] 404 on bad URL

## Post-deploy verification

- [ ] Vercel deployment **Ready** (build log shows no env validation errors)
- [ ] Deployment Git SHA matches expected commit on `main`
- [ ] Rotate Supabase keys if any secret was ever committed or shared

---

## Quick reference (copy-paste)

```
Framework Preset:     Next.js
Install Command:      npm install
Build Command:        npm run build
Output Directory:     (leave blank / default)
Root Directory:       (leave blank)
Node.js Version:      22.x
Production Branch:    main

NEXT_PUBLIC_SUPABASE_URL=https://kfpaevryzgnjllqaihtf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SITE_URL=https://kin-press.vercel.app
```

See also: [docs/VERCEL_ENV_CHECKLIST.md](docs/VERCEL_ENV_CHECKLIST.md) · [AUDIT_REPORT.md](AUDIT_REPORT.md)
