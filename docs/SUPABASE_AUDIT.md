# KinPress Supabase Audit

**Project ref:** `kfpaevryzgnjllqaihtf`  
**App:** Next.js 16 + `@supabase/ssr`  
**Audit basis:** Code in `src/` compared to `supabase/migrations/*`

---

## Executive summary

| Area | Status | Notes |
|------|--------|--------|
| Auth (email/password) | Ready | No OAuth in UI; callback used for email confirm |
| Core tables | Ready | profiles, articles, saved_articles, categories, comments, authors, resources, opportunities, events |
| RLS | Ready after migrations | Run 001 → 002_editorial_fields → `kinpress_production_audit_fix` → 003 → 004 → 005 |
| Storage | Ready | Bucket `article-covers` (public); admin upload policies |
| Seed data | Ready | `seed_editorial.sql` — verified resource/opportunity/event records only; no fake articles |
| Legacy tables | Unused | `tags`, `article_tags` — no app queries |

**Code fix applied:** Migration `003_supabase_app_alignment.sql` adds missing **authors INSERT** policy (required by `ensureUserProfile()`).

---

## 1. Auth audit

### What the app implements

| Feature | Implementation |
|---------|----------------|
| Sign up | `auth-form.tsx` → `supabase.auth.signUp()` + `emailRedirectTo: getAuthCallbackUrl()` |
| Login | `signInWithPassword()` |
| Logout | `sign-out-button.tsx` → `signOut()` |
| Session | `@supabase/ssr` cookies; `src/middleware.ts` → `updateSession()` |
| Profile bootstrap | Trigger `handle_new_user` + `ensureUserProfile()` + `POST /api/auth/setup` |
| Protected routes | `/profile`, `/saved`, `/for-you` (middleware) |
| Admin routes | `/admin/*` — middleware + `requireAdmin()` checks `profiles.role = 'admin'` |
| Callback | `GET /auth/callback` — `exchangeCodeForSession(code)` |

### OAuth

**Not used in the UI.** Only email/password. `/auth/callback` is still required for **email confirmation** and magic-link style flows.

### Required Supabase Auth dashboard settings

| Setting | Value |
|---------|--------|
| **Site URL** | `https://kin-press.vercel.app` |
| **Redirect URLs** | `https://kin-press.vercel.app/auth/callback` |
| | `http://localhost:3000/auth/callback` |
| **Email provider** | Enabled (for signup confirmation if required) |
| **Confirm email** | Your choice — if enabled, users must confirm before session |

### App env for redirects

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Production origin (`getAuthSiteOrigin()`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client key |

---

## 2. Database schema (required by app)

### `auth.users` (Supabase Auth)

- Source of truth for login
- `profiles.id` and `authors.id` FK → `auth.users(id)`

### `public.profiles`

| Column | Type | App usage |
|--------|------|-----------|
| `id` | uuid PK → auth.users | User id |
| `display_name` | text | Profile page, comments, masthead |
| `username` | text unique | Profile page |
| `avatar_url` | text | Profile display (optional) |
| `bio` | text | Profile page |
| `role` | text default `'reader'` | **Must be `'admin'` for admin access** |
| `subscription_status` | text | Display only |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | Auto-set by trigger (003) |

### `public.authors`

| Column | Type | App usage |
|--------|------|-----------|
| `id` | uuid PK → auth.users | — |
| `name` | text | Legacy; trigger + `ensureAuthorRow()` |

**App does not read `authors` for article cards** — uses `articles.author_name` text.

### `public.articles` (core)

| Column | Type | App usage |
|--------|------|-----------|
| `id` | uuid PK | Save, comments |
| `title` | text required | Everywhere |
| `slug` | text unique | URLs `/articles/[slug]` |
| `subtitle` | text | Optional |
| `summary` | text | Legacy; mirrored to excerpt |
| `excerpt` | text | Cards, search, detail (002) |
| `body` | text required | Detail page |
| `category_id` | uuid FK → categories | Admin form |
| `category_name` | text | Cards, filters, search |
| `tags` | text[] | Detail, search filter |
| `cover_image_url` | text | Images |
| `image_url` | text | Preferred image (002) |
| `source_name` | text | Curated external attribution |
| `source_url` | text | Curated external link |
| `is_premium` | boolean | Badge |
| `is_featured` | boolean | Homepage hero |
| `editor_pick` | boolean | Admin tabs |
| `status` | text | **`published` public; `draft` admin-only** |
| `published_at` | timestamptz | Sort, display |
| `author_id` | uuid → auth.users | Admin insert |
| `author_name` | text | Bylines |
| `reading_time` | int | Cards (002) |
| `region` | text | Search filter (002) |
| `topic` | text | Rails, `/topic/[topic]` (002) |
| `article_kind` | text | `kinpress_original` \| `curated_external` |
| `created_at` / `updated_at` | timestamptz | — |

**Indexes (002):** `published_at`, `topic`, `region`, partial `is_featured`, `editor_pick`

### `public.categories`

| Column | App usage |
|--------|-----------|
| `id`, `name`, `slug`, `is_active`, `sort_order` | Admin dropdown, `/categories/[slug]`, `/sections` |

**No admin UI to create categories** — use seed SQL.

### `public.saved_articles`

| Column | App usage |
|--------|-----------|
| `user_id` + `article_id` | Composite PK; save/unsave |
| `created_at` | Sort saved list |

### `public.comments`

| Column | App usage |
|--------|-----------|
| `article_id`, `user_id`, `user_name`, `user_avatar_url`, `comment_text` | Article page |
| `status` | App sets `'visible'`; public read visible only |

### `public.tags` / `public.article_tags`

**Not queried by current app.** Safe to keep for future; optional.

---

## 3. RLS policy matrix

### Articles

| Actor | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| Anonymous | Published only | — | — | — |
| Authenticated reader | Published only | — | — | — |
| Admin | All rows | Yes | Yes | Yes |

Policies: `Public read published articles`, `Admins read all articles`, `Admins manage articles`

### Profiles

| Actor | SELECT | UPDATE own | INSERT own |
|-------|--------|------------|------------|
| Anyone | All profiles (public read) | — | — |
| Authenticated | Own + others | Own row only | Own row only |

### Saved articles

| Actor | SELECT | INSERT | DELETE |
|-------|--------|--------|--------|
| Owner | Own saves only | Own | Own |

**No UPDATE** — app toggles insert/delete only.

### Comments

| Actor | SELECT | INSERT | DELETE |
|-------|--------|--------|--------|
| Anyone | `status = visible` | — | — |
| Authenticated | — | Own user + **published article** (003) | Own |

### Authors

| Actor | SELECT | INSERT |
|-------|--------|--------|
| Anyone | Yes | Own row (003) |

### Categories

| Actor | SELECT |
|-------|--------|
| Anyone | `is_active = true` |

### Regular users cannot

- Insert/update/delete articles (unless admin role)
- Read other users’ `saved_articles` rows
- Update other users’ profiles
- Insert comments on draft articles (003)

---

## 4. Storage

| Bucket | Public | App usage |
|--------|--------|-----------|
| `article-covers` | Yes | Admin cover upload in `admin/articles/new` |

**Policies (audit fix):** Public read; admin insert/update/delete on `storage.objects`

**Image URLs in seed:** External Unsplash URLs — no upload required for seed.

**Limits:** Configure in Supabase Dashboard → Storage → bucket settings (default typically 50MB).

---

## 5. Seed data

**File:** `supabase/seed_editorial.sql`

- 8 categories: News, Culture, Politics, Business, History, Arts, Community, Opinion
- 18 published articles — Black news/culture topics, evergreen tone
- 2 curated external briefs (summary + source link only)
- Author: `KinPress Editorial`
- Safe re-run: `ON CONFLICT (slug) DO UPDATE`

**Not included:** Lorem ipsum, fake breaking news claims.

---

## 6. Migration run order

Run in Supabase SQL Editor **in this order**:

1. `001_kinpress_schema.sql`
2. `002_editorial_fields.sql`
3. `kinpress_production_audit_fix.sql`
4. `003_supabase_app_alignment.sql` ← **new**
5. `seed_editorial.sql`

Then promote admin:

```sql
update public.profiles
set role = 'admin'
where id = '<your-auth-user-uuid>';
```

---

## 7. Vercel environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://kfpaevryzgnjllqaihtf.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-key>
NEXT_PUBLIC_SITE_URL=https://kin-press.vercel.app
```

Do **not** set `SUPABASE_SERVICE_ROLE_KEY` as `NEXT_PUBLIC_*`.

---

## 8. Manual Supabase dashboard checklist

### Authentication
- [ ] Site URL = production domain
- [ ] Redirect URLs include `/auth/callback` (prod + localhost)
- [ ] Email auth enabled
- [ ] Decide confirm-email on/off

### Database
- [ ] All 4 migrations + seed applied
- [ ] Table Editor shows `articles` with editorial columns
- [ ] At least one `profiles.role = 'admin'`

### Storage
- [ ] Bucket `article-covers` exists and is public
- [ ] Test admin image upload from `/admin/articles/new`

### API
- [ ] Project Settings → API → Data API exposes `public` schema (default)
- [ ] RLS enabled on all public tables (001 does this)

### Security
- [ ] Rotate keys if ever exposed in chat/logs
- [ ] Review Auth → Users for test accounts

---

## 9. User-flow test plan

| # | Flow | Steps | Expected |
|---|------|--------|----------|
| 1 | Anonymous browse | Open `/` | Hero + rails after seed |
| 2 | Article read | Open `/articles/black-owned-business-growth` | Full article, no auth required |
| 3 | Sign up | `/signup` → submit | Profile created; redirect or confirm email |
| 4 | Login | `/login` | Session cookie; `/profile` works |
| 5 | Profile edit | Change display name → save | Persists in `profiles` |
| 6 | Save article | Click Save on article | Row in `saved_articles` |
| 7 | Saved list | `/saved` | Shows saved article |
| 8 | Unsave | Save again on article | Row removed |
| 9 | Search | `/search?q=business` | Results from `articles` |
| 10 | Comment | Post comment logged in | Visible on article |
| 11 | Admin gate | Non-admin visit `/admin` | Redirect `/` |
| 12 | Admin publish | Create article → published | Appears on homepage |
| 13 | Logout | Sign out | Session cleared |
| 14 | Storage | Admin upload cover image | Public URL on article |

---

## 10. Gaps / intentional limitations

| Item | Detail |
|------|--------|
| `editor` role | Defined in 001 but app checks **`admin` only** |
| Category CRUD | Seed only; no admin UI |
| `tags` / `article_tags` tables | Unused by app |
| Avatar upload | `avatar_url` field exists; no upload UI |
| OAuth providers | Not in app — enable in Supabase only if you add UI later |
| Unpublish article | Admin can set `status = draft` via form |

---

## Files reference

| File | Purpose |
|------|---------|
| `supabase/migrations/001_kinpress_schema.sql` | Base schema + RLS |
| `supabase/migrations/002_editorial_fields.sql` | Editorial columns + admin-only writes |
| `supabase/migrations/kinpress_production_audit_fix.sql` | RLS hardening + storage |
| `supabase/migrations/003_supabase_app_alignment.sql` | Authors RLS, comments, grants, triggers |
| `supabase/seed_editorial.sql` | Starter content |
