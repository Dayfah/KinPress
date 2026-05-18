import { normalizeArticle, type ArticleRow } from "@/lib/editorial/normalize";
import type { EditorialArticle } from "@/lib/editorial/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SAVED_SELECT = `
  article:articles(
    id,
    slug,
    title,
    subtitle,
    summary,
    excerpt,
    body,
    category_name,
    tags,
    author_name,
    source_name,
    source_url,
    cover_image_url,
    image_url,
    published_at,
    updated_at,
    status,
    is_featured,
    editor_pick,
    reading_time,
    region,
    topic,
    article_kind,
    is_premium
  )
`;

type SavedRow = {
  article: ArticleRow | ArticleRow[] | null;
};

export async function getSavedEditorialArticles(
  userId: string,
): Promise<EditorialArticle[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("saved_articles")
    .select(SAVED_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<SavedRow[]>();

  if (error) {
    console.error("[KinPress] getSavedEditorialArticles", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => (Array.isArray(row.article) ? row.article[0] : row.article))
    .filter((article): article is ArticleRow => Boolean(article))
    .filter((article) => article.status === "published")
    .map(normalizeArticle);
}
