# KinPress Supabase setup

**Project ref:** `kfpaevryzgnjllqaihtf`  
**Full audit:** [SUPABASE_AUDIT.md](./SUPABASE_AUDIT.md)

## 1. Run migrations (SQL Editor, in order)

1. `supabase/migrations/001_kinpress_schema.sql`
2. `supabase/migrations/002_editorial_fields.sql`
3. `supabase/migrations/kinpress_production_audit_fix.sql`
4. `supabase/migrations/003_supabase_app_alignment.sql`
5. `supabase/migrations/004_production_safe_hardening.sql` (role-escalation guard, idempotent RLS)
6. `supabase/seed_editorial.sql` (optional starter content; safe to re-run)

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

Unused by UI today: `tags`, `article_tags`.

## 4. Storage

- Bucket: `article-covers` (public)
- Admin cover upload: `/admin/articles/new`

## 5. Admin user

After signup:

```sql
update public.profiles
set role = 'admin'
where id = '<your-auth-user-uuid>';
```

## 6. Environment variables

See [.env.example](../.env.example) and [VERCEL_ENV_CHECKLIST.md](./VERCEL_ENV_CHECKLIST.md).

## 7. Smoke test

- [ ] Homepage shows published articles
- [ ] `/articles/<slug>` loads
- [ ] Signup / login / profile
- [ ] Save / unsave article
- [ ] Admin can publish
