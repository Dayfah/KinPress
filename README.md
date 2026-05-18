# KinPress

KinPress is a Black-centered digital news platform covering culture, politics, history, business, art, and community stories with depth, clarity, and style. Readers get an Apple News–inspired homepage; editors publish original stories and curated external briefs through Supabase.

**Live:** https://kin-press.vercel.app  
**Repo:** https://github.com/Dayfah/KinPress

## Tech stack

- **Next.js 16** (App Router) · React 19 · TypeScript
- **Tailwind CSS v4**
- **Supabase** — Auth, Postgres, Storage, RLS
- **Vercel** — hosting

## Quick start (local)

```bash
git clone https://github.com/Dayfah/KinPress.git
cd KinPress
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Run migrations and seed in Supabase (see [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)), then:

```bash
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes* | Preferred public key |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes* | Legacy fallback |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Auth redirects (`http://localhost:3000` or production URL) |

\* Provide **one** of publishable or anon key.  
**Never** commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` as `NEXT_PUBLIC_*`.

Template: [.env.example](.env.example)

## Supabase

1. Create or use project `kfpaevryzgnjllqaihtf` (or your own).
2. Run SQL migrations in order — [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).
3. Configure Auth redirect URLs (`/auth/callback`).
4. Promote an admin: `update profiles set role = 'admin' where id = '…';`

**Tables used:** `profiles`, `authors`, `articles`, `categories`, `saved_articles`, `comments`.

## Deploy to Vercel

1. Import `Dayfah/KinPress` → production branch **`main`**.
2. Framework: **Next.js** (auto-detected).
3. Set env vars from [.env.example](.env.example) — see [docs/VERCEL_ENV_CHECKLIST.md](docs/VERCEL_ENV_CHECKLIST.md).
4. Ensure `vercel.json` includes build memory if needed (`NODE_OPTIONS=--max-old-space-size=8192`).
5. Deploy and run [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

No automated test suite yet — use the deployment checklist for manual QA.

## Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Homepage hero + topic rails |
| `/topic/[topic]` | Public | Section pages |
| `/articles/[slug]` | Public | Article detail |
| `/search`, `/latest`, `/sections` | Public | Discovery |
| `/categories/[slug]` | Public | Category archive |
| `/login`, `/signup` | Public | Email/password auth |
| `/profile`, `/saved`, `/for-you` | Auth | Reader features |
| `/admin/*` | Admin | Publishing (`profiles.role = 'admin'`) |

## Auth

- Email/password via Supabase Auth
- Callback: `/auth/callback` (email confirmation)
- Profile bootstrap: DB trigger + `POST /api/auth/setup`
- Protected routes enforced in middleware (`/profile`, `/saved`, `/for-you`, `/admin/*`)

## Admin / editor

Only **`admin`** role is checked in the app (not `editor`). Promote users in SQL after signup.

## Documentation index

| Doc | Purpose |
|-----|---------|
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Pre/post release steps |
| [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) | Migrations, auth, tables |
| [docs/SUPABASE_AUDIT.md](docs/SUPABASE_AUDIT.md) | Full Supabase audit |
| [docs/VERCEL_ENV_CHECKLIST.md](docs/VERCEL_ENV_CHECKLIST.md) | Vercel env vars |
| [docs/VERCEL_AUDIT.md](docs/VERCEL_AUDIT.md) | Vercel production audit |
| [docs/REPO_AUDIT.md](docs/REPO_AUDIT.md) | Repository hygiene audit |
| [AUDIT_REPORT.md](AUDIT_REPORT.md) | Pre-launch summary |

## License

UNLICENSED — private project.
