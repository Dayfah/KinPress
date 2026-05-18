import type { ArticleKind, ArticleRegion, ArticleTopic, EditorialArticle } from "@/lib/editorial/types";
import { ARTICLE_KINDS, ARTICLE_REGIONS, ARTICLE_TOPICS } from "@/lib/editorial/types";

export type ArticleRow = {
  id: string;
  slug: string;
  title: string | null;
  subtitle: string | null;
  summary: string | null;
  excerpt: string | null;
  body: string | null;
  category_name: string | null;
  tags: string[] | null;
  author_name: string | null;
  source_name: string | null;
  source_url: string | null;
  cover_image_url: string | null;
  image_url: string | null;
  published_at: string | null;
  updated_at: string | null;
  status: string | null;
  is_featured: boolean | null;
  editor_pick: boolean | null;
  reading_time: number | null;
  region: string | null;
  topic: string | null;
  article_kind: string | null;
  is_premium: boolean | null;
  categories?: { name: string | null; slug: string | null } | { name: string | null; slug: string | null }[] | null;
};

function pickTopic(value: string | null | undefined): ArticleTopic {
  if (value && ARTICLE_TOPICS.includes(value as ArticleTopic)) {
    return value as ArticleTopic;
  }
  return "culture";
}

function pickRegion(value: string | null | undefined): ArticleRegion {
  if (value && ARTICLE_REGIONS.includes(value as ArticleRegion)) {
    return value as ArticleRegion;
  }
  return "national";
}

function pickKind(value: string | null | undefined): ArticleKind {
  if (value && ARTICLE_KINDS.includes(value as ArticleKind)) {
    return value as ArticleKind;
  }
  return "kinpress_original";
}

function categoryFromRow(row: ArticleRow) {
  const embedded = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  return {
    name: embedded?.name ?? row.category_name ?? "News",
    slug: embedded?.slug ?? (row.category_name ?? "news").toLowerCase().replace(/\s+/g, "-"),
  };
}

export function normalizeArticle(row: ArticleRow): EditorialArticle {
  const category = categoryFromRow(row);
  const kind = pickKind(row.article_kind);
  const excerpt =
    row.excerpt?.trim() ||
    row.summary?.trim() ||
    row.subtitle?.trim() ||
    "Read the full story on KinPress.";
  const imageUrl = row.image_url?.trim() || row.cover_image_url?.trim() || null;
  const isExternal = kind === "curated_external" && Boolean(row.source_url?.trim());

  return {
    id: row.id,
    title: row.title?.trim() || "Untitled story",
    slug: row.slug,
    excerpt,
    body: row.body?.trim() || "",
    category: category.name,
    categorySlug: category.slug,
    tags: row.tags ?? [],
    author: row.author_name?.trim() || "KinPress Editorial",
    sourceName: row.source_name?.trim() || null,
    sourceUrl: row.source_url?.trim() || null,
    imageUrl,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    status: row.status === "published" ? "published" : "draft",
    featured: Boolean(row.is_featured),
    editorPick: Boolean(row.editor_pick),
    readingTime: row.reading_time ?? 4,
    region: pickRegion(row.region),
    topic: pickTopic(row.topic),
    kind,
    isPremium: Boolean(row.is_premium),
    href: isExternal && row.source_url ? row.source_url : `/articles/${row.slug}`,
    isExternal,
  };
}

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function estimateReadingTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
