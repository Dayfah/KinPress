# KinPress Supabase setup

**Project ref:** `kfpaevryzgnjllqaihtf`  
**Full audit:** [SUPABASE_AUDIT.md](./SUPABASE_AUDIT.md)

## 1. Run migrations (SQL Editor, in order)

1. `supabase/migrations/001_kinpress_schema.sql`
2. `supabase/migrations/002_editorial_fields.sql`
3. `supabase/migrations/kinpress_production_audit_fix.sql`
4. `supabase/migrations/003_supabase_app_alignment.sql`
5. `supabase/migrations/004_production_safe_hardening.sql` (role-escalation guard, idempotent RLS)
6. `supabase/migrations/005_community_resources_opportunities_events.sql`
7. `supabase/seed_editorial.sql` (optional starter content; safe to re-run)

## 2. Auth URL configuration

| Setting | Value |
|---------|--------|
| **Site URL** | `https://kin-press.vercel.app` |
| **Redirect URLs** | `https://kin-press.vercel.app/auth/callback` |
| | `http://localhost:3000/auth/callback` |

Enable **Email** provider. Decide whether email confirmation is required.

## 3. Tables the app uses

| Table | Purpose |
|-------|---------|
| `profiles` | User profile + `role` (`reader` / `admin`) |
| `authors` | Linked to `auth.users` (signup bootstrap) |
| `articles` | Editorial content (`status`, `topic`, `article_kind`, …) |
| `categories` | Section labels (seeded) |
| `saved_articles` | Reader saves |
| `comments` | Article comments (`status = visible`) |
| `resources` | Verified community resources |
| `opportunities` | Verified grants, jobs, scholarships, programs |
| `events` | Verified community events |
| `user_preferences` | Reader recommendation preferences |
| `ingestion_runs` | Server-side ingestion audit log |

Unused by UI today: `tags`, `article_tags`.

## 4. Content ingestion

Set server-only env vars in Vercel before enabling ingestion:

- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- Optional: `GNEWS_API_KEY`
- Optional: `KINPRESS_NEWS_RSS_FEEDS`
- Optional: `KINPRESS_RESOURCE_FEED_URLS`
- Optional: `KINPRESS_OPPORTUNITY_FEED_URLS`
- Optional: `KINPRESS_EVENT_FEED_URLS`

Run ingestion manually:

```bash
curl -X POST https://kin-press.vercel.app/api/ingest/news \
  -H "Authorization: Bearer <CRON_SECRET>"
```

## 5. Storage

- Bucket: `article-covers` (public)
- Admin cover upload: `/admin/articles/new`

## 6. Admin user

After signup:

```sql
update public.profiles
set role = 'admin'
where id = '<your-auth-user-uuid>';
```

## 7. Environment variables

See [.env.example](../.env.example) and [VERCEL_ENV_CHECKLIST.md](./VERCEL_ENV_CHECKLIST.md).

## 8. Smoke test

- [ ] Homepage shows published articles
- [ ] `/articles/<slug>` loads
- [ ] Signup / login / profile
- [ ] Save / unsave article
- [ ] Admin can publish
- [ ] `/resources`, `/opportunities`, `/events`
- [ ] `/api/ingest/news` with `CRON_SECRET`
