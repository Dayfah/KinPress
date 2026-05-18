# KinPress Vercel Production Audit

**Live URL:** https://kin-press.vercel.app  
**Repository:** https://github.com/Dayfah/KinPress  
**Audit date:** 2026-05-16 (local) / production checked 2026-05-17 UTC  

---

## Executive summary

| Area | Status | Severity |
|------|--------|----------|
| Build config (local) | OK | — |
| Latest GitHub `main` deploy | **FAILED** (`bf605cb`) | Critical |
| Production alias | **Stale** — serving last good deploy | Critical |
| Env vars (inferred) | Supabase likely configured | Medium |
| Article detail pages | **HTTP 500** on live site | Critical |
| Homepage content | Empty / no published articles | High |
| Editorial overhaul (local) | **Not pushed to GitHub** | Critical |
| Security | No service role in client code | OK |
| Broken `.npmrc` on `main` | Blocks future deploys | Critical |

**Bottom line:** Production is **not go-live ready**. The live site runs an older successful build (`cea1013` metadata confirmed), while `main` has a failed deployment and a placeholder `.npmrc` that will break `npm install` on Vercel. Article URLs error at runtime. A large editorial refactor exists only in your local working tree.

---

## 1. Build settings

### Vercel / repo configuration

| Setting | Expected (Next.js) | Repo value | Notes |
|---------|-------------------|------------|-------|
| Framework preset | Next.js | `vercel.json` → `"framework": "nextjs"` | Correct |
| Build command | `next build` | `npm run build` | Correct |
| Output directory | (auto) | Not set | Correct for Next.js |
| Install command | `npm install` | `npm install` | Correct |
| Node version | 20.x LTS recommended | **Not pinned** | Vercel uses default (22.x). Add `engines` in `package.json` or `.nvmrc` |
| Package manager | npm | `package-lock.json` present | Consistent |
| Lockfile | Committed | `package-lock.json` | OK |

### Local `vercel.json` (uncommitted improvements)

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

**On GitHub `main` (`bf605cb`):** `vercel.json` has no `NODE_OPTIONS` — builds may OOM on large merges.

### Lockfile consistency

- `package-lock.json` matches `package.json` locally; build passes.
- **Risk:** GitHub `main` added `.npmrc` with invalid registry URLs (`registry=https:// /`) — **will break CI/Vercel install** on next successful trigger.

### Recommendation

1. **Delete or fix `.npmrc` on `main`** before any deploy.
2. Commit `vercel.json` with `NODE_OPTIONS=--max-old-space-size=8192`.
3. Add to `package.json`:

```json
"engines": {
  "node": ">=20 <23"
}
```

---

## 2. Environment variables

### Required (client-safe, `NEXT_PUBLIC_*`)

| Variable | Required | Used by |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | All Supabase clients |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes* | Preferred anon/publishable key |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes* | Fallback if publishable unset |
| `NEXT_PUBLIC_SITE_URL` | Strongly recommended | Auth email redirects (`getAuthSiteOrigin`) |

\* One of publishable or anon key is required.

### Not used / must not expose

| Variable | Status |
|----------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | Not referenced in `src/` — do not add as `NEXT_PUBLIC_*` |
| `GNEWS_API_KEY` | Removed from active paths on `cea1013`; not needed |
| Admin API keys | None in app |

### Environment matrix

| Environment | `NEXT_PUBLIC_SITE_URL` | Supabase keys |
|-------------|------------------------|---------------|
| **Production** | `https://kin-press.vercel.app` | Production project |
| **Preview** | Omit (uses `VERCEL_URL`) or set per-preview | Same or staging project |
| **Development** | `http://localhost:3000` in `.env.local` | Dev project or shared |

### Verification (inferred from live behavior)

- Login/signup pages render → app bundle deployed.
- Homepage loads without config banner → env vars likely set on Vercel.
- Empty hero → Supabase returns zero published articles **or** query returns empty (not missing env).
- Article 500 → Supabase reachable; failure is **runtime** (likely `comments` query), not missing URL/key.

### Security check

- Grep: no `SERVICE_ROLE`, no secret keys in `src/`.
- Only `NEXT_PUBLIC_*` used for Supabase in client/server helpers.

---

## 3. Deployment health

### GitHub ↔ Vercel

| Check | Finding |
|-------|---------|
| Repo connected | Yes — `vercel[bot]` deploys on push |
| Production branch | `main` |
| Latest commit on `main` | `bf605cb` — merge PR #24 (`.npmrc` template) |
| Latest production deploy | **FAILED** at `bf605cb` (2026-05-17T23:43Z) |
| Live site commit | **`cea1013`** (inferred from HTML `<title>` and meta description matching that commit’s `layout.tsx`) |
| Stale deployment | **Yes** — production alias did not advance because latest build failed |

### Successful production deploys (recent)

| SHA | Time (UTC) | Status |
|-----|------------|--------|
| `cea1013` | 2026-05-17 20:31 | success |
| `d2cd80f` | 2026-05-17 22:29 | success (scaffold `todos` demo — do not promote) |

### Local vs remote

- Local `main`: `cea1013` (behind `origin/main` by 1+ commits after fetch).
- **Large uncommitted editorial refactor** (homepage, `src/lib/editorial/*`, migrations, seed) — **not on GitHub or Vercel**.

### Redirects / rewrites

| Rule | Source | Status |
|------|--------|--------|
| `/article/:slug` → `/articles/:slug` | `next.config.ts` | OK on `cea1013` |
| Middleware session refresh | `src/middleware.ts` | OK |
| No `vercel.json` rewrites | — | OK |

### Runtime errors (live probes)

| URL | HTTP | Result |
|-----|------|--------|
| `/` | 200 | Loads; empty editorial-style hero (no articles) |
| `/login`, `/signup` | 200 | OK |
| `/articles/black-owned-business-growth` | **500** | Server error (comments or downstream throw) |
| `/nonexistent-page-404-test` | 404 | Custom not-found works |

---

## 4. App functionality on production

Based on live probes + deployed commit `cea1013`:

| Feature | Status | Notes |
|---------|--------|-------|
| Homepage loads | Pass | Empty state (no hero article) |
| Article cards | **Fail** | No rails/cards without seed + working queries |
| Article detail | **Fail** | HTTP 500 when article exists |
| Signup / Login UI | Pass | Forms render |
| Logout | Untested | Requires session |
| Profile | Untested | Protected route |
| Save / unsave | Untested | Needs auth + articles |
| Admin publish | Untested | Needs admin role + deploy with admin routes |
| Mobile nav | Pass | Bottom nav in layout |
| Dark / light mode | Pass | Theme toggle + script present |
| Logo | Pass | `/kinpress-logo.svg` loads |
| 404 | Pass | Custom `not-found.tsx` |
| Loading / empty states | Partial | Empty homepage; article errors hard-fail |

### Post-deploy test instructions

After pushing editorial code, fixing `.npmrc`, running Supabase migrations + seed, and a **green** Vercel deploy:

1. `/` — hero + at least one topic rail.
2. `/articles/<seed-slug>` — full article, no 500.
3. `/signup` → confirm email if enabled → `/profile`.
4. Save article → `/saved`.
5. Admin user → `/admin/articles/new` → publish → appears on `/`.
6. Toggle dark mode; check logo on mobile width.
7. Visit bogus URL → 404 page.

---

## 5. Performance

| Topic | Finding | Recommendation |
|-------|---------|----------------|
| Bundle | Next 16 + Turbopack build ~18s compile | Acceptable |
| Images | `images.unoptimized: true` in `next.config.ts` | Faster build; larger LCP on mobile — consider `remotePatterns` + optimization later |
| Fonts | System / Tailwind stack in `globals.css` | OK |
| Caching | `force-dynamic` on article routes | Correct for auth/comments; homepage could use revalidate later |
| API routes | `/api/auth/setup`, `/api/auth/profile` | Light; no heavy serverless work |
| Build memory | Local build OK; add `NODE_OPTIONS` on Vercel | See `vercel.json` |

---

## 6. Security

| Check | Result |
|-------|--------|
| Secrets in build logs | Cannot verify remotely — avoid `console.log` env in CI |
| Private env in browser | Only `NEXT_PUBLIC_*` for Supabase |
| Service role client-side | Not used |
| Preview deployments | Use same Supabase project only if acceptable; prefer separate project for staging |
| Auth redirect URLs | Set `NEXT_PUBLIC_SITE_URL` + Supabase Site URL to `https://kin-press.vercel.app` |

---

## 7. Exact env vars for Vercel

```env
NEXT_PUBLIC_SUPABASE_URL=https://kfpaevryzgnjllqaihtf.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-or-anon-key>
NEXT_PUBLIC_SITE_URL=https://kin-press.vercel.app
```

Optional fallback (instead of publishable):

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=<legacy-anon-jwt>
```

**Do not set:** `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_` prefix.

---

## 8. Vercel dashboard checklist

### Project settings

- [ ] **Git** → Connected to `Dayfah/KinPress`, production branch `main`
- [ ] **Deployments** → Latest production build **green** (currently red on `bf605cb`)
- [ ] **Environment Variables** → All three `NEXT_PUBLIC_*` vars on Production (+ Preview if needed)
- [ ] **Build & Development** → Framework: Next.js; Build: `npm run build`; Install: `npm install`
- [ ] **Node.js Version** → 20.x (recommended)
- [ ] **Domains** → `kin-press.vercel.app` → Production deployment

### After fix

- [ ] Redeploy from fixed `main` (or promote last good only as temporary measure)
- [ ] Confirm deployment SHA matches expected commit
- [ ] Run smoke tests (section 4)

---

## 9. Code fixes needed

| Priority | Fix | Why |
|----------|-----|-----|
| P0 | Remove/fix `.npmrc` on GitHub `main` | Broken registry URL fails install |
| P0 | Push editorial refactor + migrations + seed | Production still on pre-editorial `cea1013` |
| P0 | Run Supabase migrations + `seed_editorial.sql` | Empty homepage + missing slugs |
| P1 | Article page: do not `throw` on comments load error | Prevents HTTP 500 when `comments` RLS/table issues |
| P1 | Commit `vercel.json` with `NODE_OPTIONS` | Prevent OOM on Vercel |
| P2 | Pin Node `engines` / `.nvmrc` | Reproducible builds |
| P2 | Re-enable image optimization with `remotePatterns` | Performance |

---

## 10. `vercel.json` fixes

**Recommended committed file:**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
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

No extra rewrites required — use `next.config.ts` redirects only.

---

## 11. Go-live checklist

### Git & Vercel

- [ ] Revert or delete broken `.npmrc` on `main`
- [ ] Commit and push editorial overhaul + `vercel.json` + docs
- [ ] Confirm Vercel production deploy **succeeds**
- [ ] Confirm `kin-press.vercel.app` shows new deployment SHA in Vercel UI

### Supabase

- [ ] Run migrations `001` → `002` → `kinpress_production_audit_fix` → `003`
- [ ] Run `seed_editorial.sql`
- [ ] Set `profiles.role = 'admin'` for your user
- [ ] Auth Site URL + redirect URLs for production domain

### Vercel env

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or anon)
- [ ] `NEXT_PUBLIC_SITE_URL=https://kin-press.vercel.app`
- [ ] Redeploy after env changes

### Smoke test (production)

- [ ] Homepage shows articles
- [ ] Article detail loads (no 500)
- [ ] Auth signup/login/logout
- [ ] Save/unsave
- [ ] Admin publish (admin user)
- [ ] Mobile nav + theme toggle + logo
- [ ] 404 page

---

## Appendix: deployment timeline (GitHub API)

| Event | SHA | Result |
|-------|-----|--------|
| Last **live** (metadata match) | `cea1013` | success |
| Later success (scaffold) | `d2cd80f` | success — todos demo |
| **Latest `main`** | `bf605cb` | **failure** — `.npmrc` / install |

**Action:** In Vercel → Deployments, confirm which deployment is assigned to **Production** domain; do not assume `main` tip is live.
