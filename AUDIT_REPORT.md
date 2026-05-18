# KinPress Pre-Launch Audit Report

**Date:** May 2026  
**Live URL:** https://kin-press.vercel.app  
**Repository:** https://github.com/Dayfah/KinPress  
**Supabase project:** `kfpaevryzgnjllqaihtf`

---

## Executive summary

KinPress is a **Next.js 16** App Router application with **Supabase** (auth, Postgres, storage) and **Vercel** deployment. The editorial stack is production-oriented: homepage hero + topic rails, article detail pages, search, saved articles, profiles, and admin publishing. Legacy **GNews/mock wire code was removed** from the active app path.

**Build status (local):** `npm run lint` — 0 errors (3 img warnings) · `npm run typecheck` — pass · `npm run build` — pass

**Repository audit:** See [docs/REPO_AUDIT.md](docs/REPO_AUDIT.md) · **Deployment:** [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) · **Supabase setup:** [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)

**Go-live blocker:** Production Supabase must have migrations + seed SQL applied and Vercel env vars set. Without this, the homepage shows an empty hero and auth/data features degrade gracefully.

---

## Critical blockers (manual — not code)

| # | Blocker | Owner action |
|---|---------|----------------|
| 1 | Supabase SQL not run on production project | Run migrations 001, 002, `kinpress_production_audit_fix.sql`, `003_supabase_app_alignment.sql`, `seed_editorial.sql` |
| 2 | Vercel env vars missing or placeholder key | Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` |
| 3 | Auth redirect URLs | Supabase → Site URL + `/auth/callback` for prod + localhost |
| 4 | Admin user | `update profiles set role = 'admin' where id = '…'` |

---

## Fixed in this audit (codebase)

| Area | Fix |
|------|-----|
| Dead code | Removed `src/lib/news/*`, `lib/articles.ts`, `kinpress-articles.ts`, `article-card.tsx`, legacy `home-hero.tsx`, `articleIngestion.ts` |
| Branding | Centralized copy in `src/lib/brand.ts`; metadata + Open Graph |
| Auth UX | Branded login/signup with logo + positioning copy |
| Navigation | Home, Culture, Politics, Business, History, Arts, Opinion, Saved, Profile; Search/Latest utilities |
| Topic pages | `/topic/[topic]` for section browsing |
| Save flow | “Sign in to save” when logged out; toggle when logged in |
| Hero | Featured story links to KinPress article page (not off-site) |
| Footer | Admin link admin-only; no public Admin leak |
| RLS SQL | `kinpress_production_audit_fix.sql` (saved articles, admin articles, storage) |
| Docs | `README.md`, `docs/VERCEL_ENV_CHECKLIST.md` |
| Vercel build | `NODE_OPTIONS=8192` in `vercel.json` |
| Dark mode | Logo invert, button contrast, curated source box |

### Production readiness pass (latest)

| Area | Fix |
|------|-----|
| Supabase queries | Removed `categories` embed from article selects (uses `category_name`); shared `ARTICLE_COLUMNS` |
| Article 500s | Comments load errors logged, not thrown; `error.tsx` boundaries |
| Auth | Callback `next` param sanitized via `sanitizeRedirectPath` |
| Env handling | Homepage shows `SupabaseConfigNotice` when env missing |
| Save flow | Saved-state check no longer throws on RLS/query errors |
| Empty states | `ContentEmptyState` on home, latest, topic sections |
| Dark mode | Buttons, outline, ghost, icon, pills use `foreground` tokens |
| Repo | Removed unused `src/utils/supabase/*`, `article-sources.ts` |

**Readiness score (local code):** 7/10 — pending GitHub push, Supabase seed, green Vercel deploy.

---

## Remaining manual tasks

### Supabase checklist

- [ ] Run `supabase/migrations/001_kinpress_schema.sql`
- [ ] Run `supabase/migrations/002_editorial_fields.sql`
- [ ] Run `supabase/migrations/kinpress_production_audit_fix.sql`
- [ ] Run `supabase/seed_editorial.sql` (or publish real articles via Admin)
- [ ] Auth → Site URL: `https://kin-press.vercel.app`
- [ ] Auth → Redirect URLs: `https://kin-press.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`
- [ ] Promote admin user in `profiles`
- [ ] Confirm Storage bucket `article-covers` exists (created in 001 migration)
- [ ] Optional: revoke/rotate keys if ever committed to chat/logs

### Vercel checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] `NEXT_PUBLIC_SITE_URL=https://kin-press.vercel.app`
- [ ] Redeploy after env changes
- [ ] Smoke-test live: `/`, `/login`, `/articles/<slug>`, `/saved`, `/admin`

### GitHub checklist

- [ ] Confirm `.env.local` is **not** tracked (`git check-ignore .env.local`)
- [ ] Commit audit changes
- [ ] Push to `main` → trigger Vercel deploy
- [ ] Review PR diff for accidental secrets
- [ ] Optional: add branch protection on `main`

---

## User acceptance test checklist

| Test | Pass? |
|------|-------|
| Homepage loads hero + rails (after seed) | |
| Empty rails hidden when no articles | |
| `/topic/culture` shows articles | |
| Article page: title, excerpt, body, save | |
| Curated article shows source attribution box | |
| Search with keyword + topic filter | |
| Login / signup / logout | |
| Profile edit saves | |
| Save article (logged in) / unsave | |
| Saved page lists saved articles | |
| Admin visible only for admin role | |
| Admin create + publish article | |
| Mobile bottom nav (Home, Search, Saved, Profile) | |
| Mobile drawer nav | |
| Dark mode: logo, buttons, cards readable | |
| Desktop header scroll / wrap | |

---

## Architecture reference

### Stack

- Next.js 16.2 · React 19 · TypeScript · Tailwind v4
- Supabase: `@supabase/ssr`, `@supabase/supabase-js`
- Deploy: Vercel (`vercel.json`)

### Key routes

| Route | Auth |
|-------|------|
| `/` | Public |
| `/topic/[topic]` | Public |
| `/articles/[slug]` | Public |
| `/search`, `/latest`, `/sections` | Public |
| `/login`, `/signup` | Guest |
| `/profile`, `/saved`, `/for-you` | Logged in |
| `/admin/*` | Admin |

### Supabase tables expected

| Table | Purpose |
|-------|---------|
| `profiles` | User profile + `role` (admin/reader) |
| `articles` | Editorial content |
| `categories` | Optional taxonomy |
| `saved_articles` | User bookmarks |
| `comments` | Article comments |
| `authors` | Linked to auth users |

### RLS expectations

| Table | Policy |
|-------|--------|
| `articles` | Public `SELECT` where `status = 'published'`; admin full access |
| `saved_articles` | User owns rows (select/insert/delete) |
| `profiles` | Public read; user updates own row |
| `comments` | Public read visible; insert as self |

### Environment variables

See `docs/VERCEL_ENV_CHECKLIST.md` and `.env.example`.

**Never expose:** `SUPABASE_SERVICE_ROLE_KEY` as `NEXT_PUBLIC_*`

---

## Security review

| Item | Status |
|------|--------|
| Service role in client | Not used |
| `.env.local` gitignored | Yes |
| Admin route middleware guard | Yes |
| RLS on articles/saves/profiles | SQL provided |
| MCP project ref in `.cursor/mcp.json` | Not a secret; project ref only |

---

## Known non-blockers

- ESLint warnings for `<img>` in profile avatar, comments, story images
- `SUPABASE_SCHEMA.md` references legacy `lib/articles.ts`
- `/for-you` exists but not in main nav
- Justice / Education / Health topics on `/sections` only
- Seed articles are **editorial samples**, not breaking news

---

## Files changed in audit (summary)

**Added:** `src/lib/brand.ts`, `src/lib/editorial/*`, `src/components/editorial/*`, `src/app/topic/[topic]`, `supabase/migrations/002_editorial_fields.sql`, `kinpress_production_audit_fix.sql`, `seed_editorial.sql`, `docs/VERCEL_ENV_CHECKLIST.md`, `AUDIT_REPORT.md`, `.cursor/mcp.json`

**Removed:** `src/lib/news/*`, legacy article components, `/api/news`

**Updated:** Nav, auth, homepage, admin, README, `vercel.json`, `globals.css`

---

## Go-live sign-off

When all **Critical blockers** and **UAT checklist** items pass:

1. Tag release in GitHub  
2. Confirm Vercel production deployment green  
3. Spot-check https://kin-press.vercel.app on mobile + desktop  
4. Announce / onboard first editors via Admin
