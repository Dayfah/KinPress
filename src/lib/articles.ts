import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

type NamedRelation = {
  name: string | null;
};

type ArticleTagRelation = {
  tag: NamedRelation | NamedRelation[] | null;
};

type RawArticle = {
  title: string | null;
  subtitle: string | null;
  body: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  is_premium: boolean | null;
  category: NamedRelation | NamedRelation[] | null;
  author: NamedRelation | NamedRelation[] | null;
  article_tags: ArticleTagRelation[] | null;
};

export type Article = {
  title: string;
  subtitle: string | null;
  body: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  isPremium: boolean;
  categoryName: string | null;
  authorName: string | null;
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

function normalizeArticle(article: RawArticle): Article {
  return {
    title: article.title ?? "Untitled article",
    subtitle: article.subtitle,
    body: article.body ?? "",
    coverImageUrl: article.cover_image_url,
    publishedAt: article.published_at,
    isPremium: Boolean(article.is_premium),
    categoryName: firstRelationName(article.category),
    authorName: firstRelationName(article.author),
    tags: tagNames(article.article_tags),
  };
}

export const getPublishedArticleBySlug = cache(async function getPublishedArticleBySlug(
  slug: string,
): Promise<Article | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
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
    throw new Error(`Unable to load article: ${error.message}`);
  }

  return data ? normalizeArticle(data) : null;
});
