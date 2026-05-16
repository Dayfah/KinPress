# AGENTS.md

## Cursor Cloud specific instructions

This repository (`KinPress — The Black Community`) is an active Next.js application.

### Current state

- **Language/Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS v4
- **Backend services:** Supabase (Auth, Postgres, Storage)
- **Deployment target:** Vercel
- **Tests:** No dedicated test suite yet
- **Lint/Type checks:** ESLint + TypeScript (`npm run lint`, `npm run typecheck`)

### Development environment

1. Install dependencies with `npm install`.
2. Create `.env.local` from `.env.example` and fill Supabase values.
3. Run local development with `npm run dev`.

### Required environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional compatibility fallback:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
