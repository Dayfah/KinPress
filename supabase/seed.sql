-- KinPress homepage seed data (reference script)
--
-- Prerequisites:
--   1. Run in Supabase SQL Editor (or psql) with INSERT on public tables and SELECT on auth.users.
--   2. At least one user in auth.users (sign up once), or edit the author_id assignment.
--   3. Align column names/types with your database (see SUPABASE_SCHEMA.md). This script assumes:
--        - public.categories (name, slug, is_active, sort_order)
--        - public.articles with columns listed in the INSERT below
--   4. If RLS blocks inserts, use the service role in a trusted environment or adjust policies for dev.
--
-- Idempotent for these category slugs and article slugs.

DO $$
DECLARE
  author_id uuid;
  id_culture uuid;
  id_business uuid;
  id_politics uuid;
BEGIN
  SELECT u.id INTO author_id
  FROM auth.users u
  ORDER BY u.created_at ASC
  LIMIT 1;

  IF author_id IS NULL THEN
    RAISE EXCEPTION 'KinPress seed: auth.users is empty. Create a user first (e.g. sign up in the app).';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'saved_articles'
  ) THEN
    DELETE FROM public.saved_articles
    WHERE article_id IN (
      SELECT id FROM public.articles WHERE slug IN (
        'kinpress-seed-labor-lines',
        'kinpress-seed-archive-memory',
        'kinpress-seed-politics-turnout'
      )
    );
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'comments'
  ) THEN
    DELETE FROM public.comments
    WHERE article_id IN (
      SELECT id FROM public.articles WHERE slug IN (
        'kinpress-seed-labor-lines',
        'kinpress-seed-archive-memory',
        'kinpress-seed-politics-turnout'
      )
    );
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'article_tags'
  ) THEN
    DELETE FROM public.article_tags
    WHERE article_id IN (
      SELECT id FROM public.articles WHERE slug IN (
        'kinpress-seed-labor-lines',
        'kinpress-seed-archive-memory',
        'kinpress-seed-politics-turnout'
      )
    );
  END IF;

  DELETE FROM public.articles WHERE slug IN (
    'kinpress-seed-labor-lines',
    'kinpress-seed-archive-memory',
    'kinpress-seed-politics-turnout'
  );

  DELETE FROM public.categories WHERE slug IN ('culture', 'business', 'politics');

  INSERT INTO public.categories (name, slug, is_active, sort_order)
  VALUES
    ('Culture', 'culture', true, 1),
    ('Business', 'business', true, 2),
    ('Politics', 'politics', true, 3);

  SELECT id INTO id_culture FROM public.categories WHERE slug = 'culture' LIMIT 1;
  SELECT id INTO id_business FROM public.categories WHERE slug = 'business' LIMIT 1;
  SELECT id INTO id_politics FROM public.categories WHERE slug = 'politics' LIMIT 1;

  -- If your schema uses jsonb for tags, replace ARRAY[...]::text[] with to_jsonb(ARRAY['labor','archive']) etc.

  INSERT INTO public.articles (
    title,
    slug,
    subtitle,
    summary,
    body,
    category_id,
    tags,
    cover_image_url,
    is_premium,
    is_featured,
    status,
    published_at,
    author_id,
    author_name
  )
  VALUES (
    'The picket line as classroom',
    'kinpress-seed-labor-lines',
    'How workers are rewriting the story of the shop floor.',
    'A dispatch from the edge of the contract fight — and what it teaches the rest of us.',
    E'When the shift whistle breaks the morning quiet, something more than work begins.\n\nWorkers trade rumors, share childcare, pass phone chargers hand to hand. The picket line becomes a syllabus: each chant a lesson in solidarity, each slowdown a footnote in a longer history of refusal.\n\nThis is not nostalgia. It is inventory — of risk, of care, of the ordinary genius required to hold a line when the heat arrives.',
    id_culture,
    ARRAY['labor', 'archive']::text[],
    'https://picsum.photos/seed/kinpress-labor/1200/800',
    false,
    true,
    'published',
    timezone('utc', now()) - interval '2 days',
    author_id,
    'KinPress Desk'
  ),
  (
    'The archive remembers twice',
    'kinpress-seed-archive-memory',
    'Black memory institutions are doing double duty.',
    'From basement boxes to reading rooms, stewards of the record carry more than paper.',
    E'Archivists know that preservation is argument. What gets labeled, what gets digitized first, which donor files sit closest to the door — each choice tilts the historical weather.\n\nCommunity archives answer to neighbors, not endowments. That difference shows up in the finding aids: names spelled the way families spell them, photographs captioned with the humor and precision of people who were there.',
    id_business,
    ARRAY['archive', 'memory']::text[],
    'https://picsum.photos/seed/kinpress-archive/1200/800',
    false,
    false,
    'published',
    timezone('utc', now()) - interval '5 days',
    author_id,
    'KinPress Desk'
  ),
  (
    'Turnout is a craft, not a miracle',
    'kinpress-seed-politics-turnout',
    'Organizers describe the slow work behind the headline numbers.',
    'Registration tables, translation apps, rides to the polls — the infrastructure of democracy.',
    E'Every cycle someone declares a surprise wave. Organizers roll their eyes — not because waves are fake, but because they are built tile by tile: the text bank trained on nuance, the barbershop agreements, the county clerk who finally picks up the phone.\n\nTurnout is logistics with a pulse. This field note sketches the checklist behind the confetti.',
    id_politics,
    ARRAY['politics', 'organizing']::text[],
    NULL,
    true,
    false,
    'published',
    timezone('utc', now()) - interval '1 day',
    author_id,
    'Maya Chen'
  );

  -- Optional: if article detail uses embed author:authors(name), ensure a matching authors row:
  -- INSERT INTO public.authors (id, name) VALUES (author_id, 'KinPress Desk')
  -- ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

END $$;
