import type { ArticleRecord } from "@/lib/content";
import { getCachedNewsArticles } from "@/lib/news/cache";
import { parseNewsCategorySlug } from "@/lib/news/categories";
import { toHomeFeedArticle, type HomeFeedArticle } from "@/lib/news/feed";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Strip ilike metacharacters and commas so `.or()` filter strings stay safe. */
export function sanitizeSearchTerm(raw: string) {
  return raw.replace(/[%_,\\]/g, " ").replace(/,/g, " ").replace(/\s+/g, " ").trim();
}

function buildPublishedArticleOrIlike(sanitizedTerm: string) {
  const inner = sanitizedTerm.replace(/"/g, '""');
  const pattern = `"%${inner}%"`;

  return [
    `title.ilike.${pattern}`,
    `subtitle.ilike.${pattern}`,
    `summary.ilike.${pattern}`,
    `category_name.ilike.${pattern}`,
    `body.ilike.${pattern}`,
  ].join(",");
}

export async function searchKinPressArticles(term: string): Promise<ArticleRecord[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const sanitized = sanitizeSearchTerm(term);

  if (!sanitized) {
    return [];
  }

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .or(buildPublishedArticleOrIlike(sanitized))
    .order("published_at", { ascending: false })
    .limit(24);

  if (error) {
    console.error("KinPress search failed", error.message);
    return [];
  }

  return (data ?? []) as ArticleRecord[];
}

export async function searchHeadlineStories(term: string): Promise<HomeFeedArticle[]> {
  const sanitized = sanitizeSearchTerm(term);

  if (!sanitized) {
    return [];
  }

  const needle = sanitized.toLowerCase();
  const result = await getCachedNewsArticles(parseNewsCategorySlug("top-stories"));

  return result.articles
    .map(toHomeFeedArticle)
    .filter(
      (article) =>
        article.title.toLowerCase().includes(needle) ||
        article.excerpt.toLowerCase().includes(needle) ||
        article.category.toLowerCase().includes(needle),
    )
    .slice(0, 12);
}

export async function unifiedSearch(term: string) {
  const [kinpress, headlines] = await Promise.all([
    searchKinPressArticles(term),
    searchHeadlineStories(term),
  ]);

  return { kinpress, headlines };
}
