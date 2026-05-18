import { cache } from "react";

import { ARTICLE_COLUMNS } from "@/lib/editorial/columns";
import { normalizeArticle, type ArticleRow } from "@/lib/editorial/normalize";
import type { ArticleTopic, EditorialArticle, HomepageData } from "@/lib/editorial/types";
import { buildHomepageRails } from "@/lib/editorial/rails";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatSupabaseError } from "@/lib/supabase/errors";

type FetchArticlesResult = {
  articles: EditorialArticle[];
  error: string | null;
};

async function fetchPublishedArticles(options?: {
  limit?: number;
  topics?: ArticleTopic[];
  featured?: boolean;
  editorPick?: boolean;
}): Promise<FetchArticlesResult> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { articles: [], error: null };
  }

  let query = supabase
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (options?.featured) {
    query = query.eq("is_featured", true);
  }

  if (options?.editorPick) {
    query = query.eq("editor_pick", true);
  }

  if (options?.topics?.length) {
    query = query.in("topic", options.topics);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query.returns<ArticleRow[]>();

  if (error) {
    console.error("[KinPress] fetchPublishedArticles", error.message);
    return {
      articles: [],
      error: formatSupabaseError(error.message, error.code),
    };
  }

  return { articles: (data ?? []).map(normalizeArticle), error: null };
}

export type HomepageDataResult = HomepageData & {
  loadError: string | null;
};

export const getHomepageData = cache(async function getHomepageData(): Promise<HomepageDataResult> {
  const { articles: all, error: loadError } = await fetchPublishedArticles({ limit: 48 });
  const featured = all.filter((a) => a.featured);
  const lead = featured[0] ?? all[0] ?? null;
  const leadId = lead?.id;
  const secondary = all.filter((a) => a.id !== leadId).slice(0, 2);
  const usedIds = new Set([leadId, ...secondary.map((a) => a.id)].filter(Boolean));

  const rails = buildHomepageRails(all, usedIds);

  return {
    hero: { lead, secondary },
    rails,
    loadError,
  };
});

export const getLatestArticles = cache(async function getLatestArticles(limit = 24) {
  const { articles } = await fetchPublishedArticles({ limit });
  return articles;
});

export const getArticlesByTopic = cache(async function getArticlesByTopic(
  topic: ArticleTopic,
  limit = 36,
) {
  const { articles } = await fetchPublishedArticles({ topics: [topic], limit });
  return articles;
});

export const getArticleBySlug = cache(async function getArticleBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<ArticleRow>();

  if (error) {
    console.error("[KinPress] getArticleBySlug", error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  return normalizeArticle(data);
});

export async function getRelatedArticles(article: EditorialArticle, limit = 4) {
  const { articles: byTopic } = await fetchPublishedArticles({
    topics: [article.topic],
    limit: limit + 4,
  });
  return byTopic.filter((item) => item.id !== article.id).slice(0, limit);
}

export async function getArticlesForAdmin() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, status, published_at, is_featured, editor_pick, category_name, topic, region",
    )
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[KinPress] getArticlesForAdmin", error.message);
    return [];
  }

  return data ?? [];
}
