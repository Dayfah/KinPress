import type { ArticleRecord } from "@/lib/content";
import {
  firstText,
  getArticleCategory,
  getArticleExcerpt,
  getArticleHref,
  getArticleImage,
} from "@/lib/content";
import type { NormalizedNewsArticle } from "@/lib/news/types";

/** View-model for homepage cards (internal + external). */
export type HomeFeedArticle = {
  id: string;
  title: string;
  href: string;
  excerpt: string;
  imageUrl: string | null;
  category: string;
  source: string;
  author: string;
  publishedAt: string;
  isExternal: boolean;
  isKinPressOriginal?: boolean;
};

export function toHomeFeedArticle(article: NormalizedNewsArticle): HomeFeedArticle {
  return {
    id: article.id,
    title: article.title,
    href: article.url,
    excerpt: article.description,
    imageUrl: article.imageUrl,
    category: article.category,
    source: article.source,
    author: article.author,
    publishedAt: article.publishedAt,
    isExternal: true,
  };
}

export function kinpressArticleToHomeFeed(article: ArticleRecord): HomeFeedArticle {
  return {
    id: String(article.id ?? article.slug ?? "kinpress"),
    title: firstText(article, ["title"], "Untitled story"),
    href: getArticleHref(article),
    excerpt: getArticleExcerpt(article),
    imageUrl: getArticleImage(article) || null,
    category: getArticleCategory(article) || "KinPress",
    source: "KinPress",
    author: firstText(article, ["author_name"], "KinPress Desk"),
    publishedAt: article.published_at ?? new Date().toISOString(),
    isExternal: false,
    isKinPressOriginal: true,
  };
}

export function pickFeaturedAndRest(articles: HomeFeedArticle[]) {
  if (articles.length === 0) {
    return { featured: null, rest: [] as HomeFeedArticle[] };
  }

  const [featured, ...rest] = articles;
  return { featured, rest };
}
