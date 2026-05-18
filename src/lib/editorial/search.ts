import { ARTICLE_COLUMNS } from "@/lib/editorial/columns";
import type { ArticleRegion, ArticleTopic, EditorialArticle } from "@/lib/editorial/types";
import { normalizeArticle, type ArticleRow } from "@/lib/editorial/normalize";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ArticleSearchFilters = {
  category?: string;
  topic?: ArticleTopic;
  region?: ArticleRegion;
  fromDate?: string;
};

function sanitizeSearchTerm(raw: string) {
  return raw.replace(/[%_,\\]/g, " ").replace(/,/g, " ").replace(/\s+/g, " ").trim();
}

function buildOrFilter(term: string) {
  const inner = term.replace(/"/g, '""');
  const pattern = `"%${inner}%"`;
  return [
    `title.ilike.${pattern}`,
    `excerpt.ilike.${pattern}`,
    `summary.ilike.${pattern}`,
    `body.ilike.${pattern}`,
    `category_name.ilike.${pattern}`,
    `author_name.ilike.${pattern}`,
    `source_name.ilike.${pattern}`,
  ].join(",");
}

export async function searchEditorialArticles(
  query: string,
  filters: ArticleSearchFilters = {},
): Promise<EditorialArticle[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const term = sanitizeSearchTerm(query);
  const hasFilters = Boolean(filters.topic || filters.region || filters.category || filters.fromDate);

  if (!term && !hasFilters) {
    return [];
  }

  let request = supabase
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(48);

  if (term) {
    request = request.or(buildOrFilter(term));
  }

  if (filters.topic) {
    request = request.eq("topic", filters.topic);
  }

  if (filters.region) {
    request = request.eq("region", filters.region);
  }

  if (filters.category) {
    request = request.ilike("category_name", `%${filters.category}%`);
  }

  if (filters.fromDate) {
    request = request.gte("published_at", filters.fromDate);
  }

  const { data, error } = await request.returns<ArticleRow[]>();

  if (error) {
    console.error("[KinPress] searchEditorialArticles", error.message);
    return [];
  }

  let articles = (data ?? []).map(normalizeArticle);

  if (filters.category) {
    const needle = filters.category.toLowerCase();
    articles = articles.filter(
      (article) =>
        article.category.toLowerCase().includes(needle) ||
        article.tags.some((tag) => tag.toLowerCase().includes(needle)),
    );
  }

  return articles;
}
