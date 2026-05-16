# KinPress Supabase schema (as used by the app)

This document is derived from **static analysis of the repository** (`src/`, `kinpress/src/`). It lists the tables, columns, and **exact filters** the Next.js app sends to PostgREST. It does **not** include secrets or production keys.

If the live site shows empty sections (“Categories will appear here…”, “No stories published yet…”), typical causes are:

1. **`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)** are missing or wrong in Vercel — the homepage uses `createSupabaseServerClient()`, which returns **`null`** and skips all queries (see `src/lib/supabase/server.ts`).
2. **Row Level Security (RLS)** denies `anon` reads on `categories` / `articles`.
3. **No rows** match the filters below (e.g. nothing with `status = 'published'` or `is_active = true`).

---

## 1. Homepage (`src/app/page.tsx`)

All three queries run only when `createSupabaseServerClient()` returns a client (env vars present).

### 1.1 Latest articles list

| Item | Value |
|------|--------|
| Table | `articles` |
| Select | `*` (all columns returned to the client) |
| Filters | `status` **equals** `'published'` |
| Order | `published_at` **descending** |
| Limit | `12` |

PostgREST-style filter: `status=eq.published`

### 1.2 Featured article (hero)

| Item | Value |
|------|--------|
| Table | `articles` |
| Select | `*` |
| Filters | `status` **equals** `'published'` **and** `is_featured` **equals** `true` |
| Order | `published_at` **descending** |
| Limit | `1` (`.maybeSingle()`) |

PostgREST-style: `status=eq.published&is_featured=eq.true`

### 1.3 Categories (section pills)

| Item | Value |
|------|--------|
| Table | `categories` |
| Select | `*` |
| Filters | `is_active` **equals** `true` |
| Order | `sort_order` **ascending** |

PostgREST-style: `is_active=eq.true`

### 1.4 How homepage cards use `select('*')` on articles

`ArticleCard` / `FeaturedArticle` read **flat** fields via `src/lib/content.ts` helpers, for example:

- Title / slug / link: `title`, `slug`
- Image: `cover_image_url`, `image_url`, or `hero_image_url`
- Excerpt / dek: `excerpt`, `summary`, or `dek`
- Category label: nested `categories.name` **or** flat `category_name`
- Date: `published_at`
- Premium badge: `is_premium`
- Author line on cards: `author_name`

Because the homepage uses **`select('*')` without embeds**, nested `categories` will **not** be populated by PostgREST. For category text on cards, ensure **`category_name`** is stored on `articles` (optional denormalized column) **or** extend the query later to embed `categories`. The admin create flow sets `category_id` but not `category_name` in code; your database may use triggers or manual updates to keep `category_name` in sync.

---

## 2. Category hub page (`src/app/categories/[slug]/page.tsx`)

| Step | Table | Select | Filters / order |
|------|--------|--------|-------------------|
| Resolve category | `categories` | `id, name, slug` | `slug` = route param, `is_active` = `true` |
| List articles | `articles` | `*` | `status` = `'published'`, `category_id` = resolved category `id`, `published_at` desc |
| Pills | `categories` | `*` | `is_active` = `true`, `sort_order` asc |

---

## 3. Article detail + saved list (`src/lib/articles.ts`)

### 3.1 Published article by slug

| Table | Select (embedded) | Filters |
|-------|-------------------|---------|
| `articles` | `id, slug, title, subtitle, body, cover_image_url, published_at, is_premium`, embed `category:categories(name)`, `author:authors(name)`, `article_tags(tag:tags(name))` | `slug` = param, `status` = `'published'` |

This implies:

- FK-style relationships PostgREST can resolve: **`articles` → `categories`**, **`articles` → `authors`**, **`articles` → `article_tags` → `tags`**.
- Expected embed names: relationship to `categories` exposed as `category`; to `authors` as `author`; through `article_tags` to `tags` as `tag`.

### 3.2 Saved articles for a user

| Table | Select | Filters |
|-------|--------|---------|
| `saved_articles` | `article:articles(...)` (nested select with same category/author embeds as above) | `user_id` = current user |

---

## 4. Comments (`src/app/articles/[slug]/page.tsx`)

| Operation | Table | Columns / filters |
|-----------|--------|-------------------|
| Read | `comments` | `id, user_name, user_avatar_url, comment_text, created_at` where `article_id` = article, `status` = `'visible'`, ordered by `created_at` asc |
| Insert | `comments` | `article_id`, `user_id`, `user_name`, `user_avatar_url`, `comment_text`, `status` (`'visible'`) |

---

## 5. Save / unsave article (`src/components/save-article-button.tsx`)

| Table | Usage |
|-------|--------|
| `saved_articles` | `select` on `article_id` for `(user_id, article_id)`; `insert` / `delete` on `user_id` + `article_id` |

---

## 6. Admin: new article (`src/app/admin/articles/new/page.tsx`)

### 6.1 Loads

| Table | Select | Filters |
|-------|--------|---------|
| `profiles` | `display_name, username, role` | `id` = auth user |
| `categories` | `id, name, slug` | `is_active` = `true`, `sort_order` asc |

### 6.2 Insert published article (relevant to homepage)

`insert` into `articles` includes (non-exhaustive list from code):

- `title`, `slug`, `body`, `status`
- `subtitle`, `summary` (optional)
- `category_id` (optional UUID/string)
- `tags` (array from form — DB type must match, e.g. `text[]` or `jsonb`)
- `cover_image_url` (optional)
- `is_premium`, `is_featured` (booleans)
- `published_at` — set to **now ISO string** when `status === 'published'`, else `null`
- `author_id` (auth user id), `author_name` (string)

### 6.3 Storage

- Bucket name: **`article-covers`**
- Upload then `getPublicUrl` for `cover_image_url`

---

## 7. Other references

| Location | Table | Notes |
|----------|--------|--------|
| `src/app/admin/page.tsx` | `articles`, `categories` | Count queries: `status = published`, `is_active = true` |
| `src/components/site-header.tsx` | `categories` | Same as homepage category query (active, sort_order) |
| `src/app/profile/page.tsx` | `profiles` | Uses its own env-strict client; `select` / `update` on profile fields |

---

## 8. Suggested physical schema (reference)

The repo does not ship authoritative SQL migrations. The following is a **reasonable** Postgres shape consistent with the app (adjust names/types to match your existing project):

- **`categories`**: `id`, `name`, `slug` (unique), `is_active` (boolean), `sort_order` (int)
- **`articles`**: `id`, `title`, `slug` (unique), `subtitle`, `summary`, `body`, `category_id` (FK → `categories`), optional `category_name` for flat list UIs, `tags`, `cover_image_url`, `is_premium`, `is_featured`, `status`, `published_at`, `author_id`, `author_name`, …
- **`authors`**: `id` (often same as `auth.users.id`), `name` — used by article embed `authors(name)`
- **`tags`**, **`article_tags`**: for article detail tag list
- **`comments`**: as in section 4
- **`saved_articles`**: `user_id`, `article_id` (and any primary key / timestamps you use)
- **`profiles`**: at least `id`, `display_name`, `username`, `role`, …

Use `supabase/seed.sql` as a **starting point** after aligning column types and FKs with your real database.

---

## 9. Environment variables (no secrets in repo)

| Variable | Used by |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server Supabase clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Preferred server key name in `createSupabaseServerClient` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Fallback if anon key unset (same role as anon for public reads) |

See `.env.example` for placeholders only.
