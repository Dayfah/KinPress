# KinPress deployment checklist

Use before and after every production release.

## GitHub

- [ ] Default branch is `main`
- [ ] **Delete broken `.npmrc` on `main`** if present (`registry=https:// /` breaks `npm install` on Vercel)
- [ ] Commit and push latest editorial + production fixes
- [ ] No `.env.local` or secrets in git history (recent commit diff)
- [ ] `npm run lint` — 0 errors
- [ ] `npm run typecheck` — pass
- [ ] `npm run build` — pass
- [ ] Push to `main` triggers Vercel

## Supabase

- [ ] Migrations 001 → 002 → audit fix → 003 applied
- [ ] Seed or real articles published
- [ ] Auth Site URL + redirect URLs set
- [ ] At least one `profiles.role = 'admin'`
- [ ] Storage bucket `article-covers` exists

See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## Vercel

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or anon key)
- [ ] `NEXT_PUBLIC_SITE_URL=https://kin-press.vercel.app`
- [ ] Production deployment status **Ready** (not failed)
- [ ] Domain `kin-press.vercel.app` points at latest good deploy

See [docs/VERCEL_ENV_CHECKLIST.md](docs/VERCEL_ENV_CHECKLIST.md) and [docs/VERCEL_AUDIT.md](docs/VERCEL_AUDIT.md).

## Production smoke test

- [ ] `/` — hero + article rails
- [ ] `/articles/<slug>` — no 500
- [ ] `/login`, `/signup`, logout
- [ ] `/profile` — edit display name
- [ ] Save / unsave → `/saved`
- [ ] `/admin` — non-admin blocked; admin can publish
- [ ] Mobile bottom nav + theme toggle
- [ ] Logo loads (`/kinpress-logo.svg`)
- [ ] 404 page on bad URL

## Post-deploy

- [ ] Confirm deployment SHA in Vercel matches expected Git commit
- [ ] Rotate Supabase keys if any secret was ever committed or shared in chat
