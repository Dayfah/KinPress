import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

type NamedRelation = {
  name: string | null;
};

type ArticleTagRelation = {
  tag: NamedRelation | NamedRelation[] | null;
};

type RawArticle = {
  id: string;
  slug: string;
  title: string | null;
  subtitle: string | null;
  body?: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  is_premium: boolean | null;
  category: NamedRelation | NamedRelation[] | null;
  author: NamedRelation | NamedRelation[] | null;
  article_tags: ArticleTagRelation[] | null;
};

export type ArticleSummary = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
  isPremium: boolean;
  categoryName: string | null;
  authorName: string | null;
};

export type Article = ArticleSummary & {
  body: string;
  tags: string[];
};

function firstRelationName(
  relation: NamedRelation | NamedRelation[] | null,
): string | null {
  if (!relation) {
    return null;
  }

  const item = Array.isArray(relation) ? relation[0] : relation;
  return item?.name ?? null;
}

function tagNames(articleTags: ArticleTagRelation[] | null): string[] {
  if (!articleTags) {
    return [];
  }

  return articleTags
    .map((articleTag) => firstRelationName(articleTag.tag))
    .filter((tag): tag is string => Boolean(tag));
}

function normalizeArticleSummary(article: RawArticle): ArticleSummary {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title ?? "Untitled article",
    subtitle: article.subtitle,
    coverImageUrl: article.cover_image_url,
    publishedAt: article.published_at,
    isPremium: Boolean(article.is_premium),
    categoryName: firstRelationName(article.category),
    authorName: firstRelationName(article.author),
  };
}

function normalizeArticle(article: RawArticle): Article {
  return {
    ...normalizeArticleSummary(article),
    body: article.body ?? "",
    tags: tagNames(article.article_tags),
  };
}

export const getPublishedArticleBySlug = cache(async function getPublishedArticleBySlug(
  slug: string,
): Promise<Article | null> {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
        id,
        slug,
        title,
        subtitle,
        body,
        cover_image_url,
        published_at,
        is_premium,
        category:categories(name),
        author:authors(name),
        article_tags(tag:tags(name))
      `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<RawArticle>();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(`Unable to load article: ${error.message}`);
  }

  return data ? normalizeArticle(data) : null;
});

type SavedArticleRow = {
  article: RawArticle | RawArticle[] | null;
};

export async function getSavedArticlesForUser(
  userId: string,
): Promise<ArticleSummary[]> {
  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("saved_articles")
    .select(
      `
        article:articles(
          id,
          slug,
          title,
          subtitle,
          cover_image_url,
          published_at,
          is_premium,
          category:categories(name),
          author:authors(name)
        )
      `,
    )
    .eq("user_id", userId)
    .returns<SavedArticleRow[]>();

  if (error) {
    throw new Error(`Unable to load saved articles: ${error.message}`);
  }

  return (data ?? [])
    .map((row) => (Array.isArray(row.article) ? row.article[0] : row.article))
    .filter((article): article is RawArticle => Boolean(article))
    .map(normalizeArticleSummary);
}
