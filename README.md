# KinPress

KinPress is a Black-centered digital community and media platform in active development.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4
- Supabase (Auth, Postgres, Storage)
- Vercel deployment target

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment template and fill values:

   ```bash
   cp .env.example .env.local
   ```

3. Start local development server:

   ```bash
   npm run dev
   ```

## Environment variables

Required (public) Supabase variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional compatibility fallback supported by the app:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Scripts

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint
- `npm run typecheck` — run TypeScript checks

## Deployment (Vercel)

This repository includes a `vercel.json` configured for Next.js. Ensure all required environment variables are set in your Vercel project before deploying.
