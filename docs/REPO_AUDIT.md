# KinPress repository audit

**Date:** May 2026  
**Repository:** https://github.com/Dayfah/KinPress  
**Branch audited (local):** `main` (behind `origin/main` at audit time)

---

## Production readiness score: **6 / 10**

| Factor | Score impact |
|--------|----------------|
| Local build/lint/typecheck pass | +2 |
| Clear docs + migrations in repo | +1 |
| No committed secrets found | +1 |
| Large uncommitted editorial work | −2 |
| GitHub `main` has failed deploy + broken `.npmrc` | −2 |
| No automated tests | −1 |
| Live production stale / article 500s | −1 |

**Target 9/10 after:** push editorial commit, remove `.npmrc` on GitHub, green Vercel deploy, Supabase seed + migrations.

---

## 1. Problems found

### Repo hygiene

| Issue | Severity |
|-------|----------|
| Editorial overhaul **not committed/pushed** (homepage, `lib/editorial/*`, migrations, seed) | Critical |
| Duplicate Supabase helpers in `src/utils/supabase/` (unused) | Medium — **removed** |
| `src/lib/article-sources.ts` + ingestion stub unused | Low — **removed** |
| Legacy GNews/mock paths marked deleted in git but were already off disk | OK |
| `console.log` / `console.debug` in `src/` | None found |
| `console.error` / `console.warn` for operational errors | Kept (intentional) |
| `SUPABASE_SCHEMA.md` outdated (old homepage queries) | Medium — see note below |
| `tsconfig.tsbuildinfo` tracked/modified | Low — **gitignore updated** |

### Security

| Check | Result |
|-------|--------|
| `.env.local` in repo | Not tracked |
| Hardcoded JWT/keys in `src/` | None |
| `SERVICE_ROLE` in client | None |
| `.cursor/mcp.json` | Project ref only (no keys) |
| `.env.example` | Placeholders only |

### Branch / deploy

| Check | Result |
|-------|--------|
| Default branch | `main` (expected) |
| Local vs `origin/main` | **Behind 10 commits** |
| Latest `origin/main` deploy | **Failed** (`bf605cb`, broken `.npmrc`) |
| Live site vs local | Stale; metadata matches older `cea1013` |
| `package-lock.json` | Consistent; local build passes |

### Code quality

| Command | Result |
|---------|--------|
| `npm run lint` | 0 errors, 3 warnings (`<img>` vs `next/image`) |
| `npm run typecheck` | Pass |
| `npm test` | No test script |
| `npm run build` | Pass |

---

## 2. Problems fixed (this audit)

| Change | File(s) |
|--------|---------|
| Removed unused `src/utils/supabase/*` | 3 files deleted |
| Removed unused `src/lib/article-sources.ts` | deleted |
| Hardened article page (comments load failure → no 500) | `src/app/articles/[slug]/page.tsx` |
| Updated `.gitignore` (env variants, `*.tsbuildinfo`, `.vercel`) | `.gitignore` |
| Pinned Node engines | `package.json` |
| Expanded `.env.example` | `.env.example` |
| Created deployment + Supabase setup docs | `DEPLOYMENT_CHECKLIST.md`, `docs/SUPABASE_SETUP.md` |
| Rewrote README | `README.md` |
| Repo audit report | `docs/REPO_AUDIT.md` |

---

## 3. Files changed

```
.gitignore
.env.example
package.json
README.md
DEPLOYMENT_CHECKLIST.md
docs/SUPABASE_SETUP.md
docs/REPO_AUDIT.md
src/app/articles/[slug]/page.tsx
src/lib/article-sources.ts          (deleted)
src/utils/supabase/client.ts        (deleted)
src/utils/supabase/server.ts        (deleted)
src/utils/supabase/middleware.ts    (deleted)
```

Plus prior session docs: `docs/SUPABASE_AUDIT.md`, `docs/VERCEL_AUDIT.md`, `supabase/migrations/003_*`, etc. (commit together).

---

## 4. Remaining manual tasks

### GitHub (urgent)

1. **Delete or fix `.npmrc` on `main`** — invalid `registry=https:// /` breaks `npm install` on Vercel.
2. **Commit and push** all local editorial + audit changes.
3. Confirm Vercel production deploy is **Ready**.
4. Optional: branch protection on `main`; require lint/build in CI.

### Supabase

- Run migrations 001 → 002 → audit fix → **003** → seed.
- Set Auth URLs; promote admin user.

### Vercel

- Set three `NEXT_PUBLIC_*` env vars; redeploy.
- Confirm production alias matches latest green deployment.

### Documentation

- Update or archive root `SUPABASE_SCHEMA.md` (superseded by `docs/SUPABASE_SETUP.md` + `docs/SUPABASE_AUDIT.md`).

### Code (optional)

- Replace `<img>` with `next/image` in profile, comment-card, safe-story-image (3 lint warnings).
- Add GitHub Action: `lint` + `typecheck` + `build`.
- Add minimal Playwright smoke tests.

---

## 5. Secret rotation warnings

**No secrets were found in the committed tree** (only empty placeholders in `.env.example`).

Rotate Supabase keys if:

- `.env.local` was ever committed to git history
- Keys appeared in Vercel logs, chat, or screenshots
- A failed PR exposed credentials

Rotation: Supabase Dashboard → Settings → API → regenerate anon/publishable key → update Vercel + local `.env.local` → redeploy.

---

## 6. Testing checklist (manual)

See [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) production smoke test section.
