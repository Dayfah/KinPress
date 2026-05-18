# KinPress — Vercel environment checklist

Set these in **Vercel → Project → Settings → Environment Variables** for **Production**, **Preview**, and **Development** (as needed).

## Required (client-safe)

| Variable | Example | Notes |
|----------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kfpaevryzgnjllqaihtf.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | Preferred API key |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Legacy fallback if not using publishable key |

Use **either** publishable key **or** anon key (app prefers publishable).

| Variable | Example | Notes |
|----------|---------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://kin-press.vercel.app` | Auth redirect origin (recommended) |

## Optional / not required today

| Variable | Notes |
|----------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; **never** expose as `NEXT_PUBLIC_*`. Not used by current app. |
## Supabase Auth URL checklist

In **Supabase → Authentication → URL configuration**:

| Setting | Value |
|---------|--------|
| **Site URL** | `https://kin-press.vercel.app` (or your production domain) |
| **Redirect URLs** | `https://kin-press.vercel.app/auth/callback` |
| | `http://localhost:3000/auth/callback` |

## After changing env vars

1. **Redeploy** on Vercel (env changes do not apply until redeploy).
2. Confirm build command: `npm run build`
3. Smoke-test: home, login, article page, saved (logged in), admin (admin user).

See also [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) and [VERCEL_AUDIT.md](./VERCEL_AUDIT.md).

## Build note

If the build OOMs on Vercel, set in project settings or `vercel.json`:

```json
{
  "build": {
    "env": {
      "NODE_OPTIONS": "--max-old-space-size=8192"
    }
  }
}
```

Or increase build machine memory in Vercel plan settings.
