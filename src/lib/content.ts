export type ArticleRecord = {
  id?: string | number;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  summary?: string | null;
  dek?: string | null;
  image_url?: string | null;
  cover_image_url?: string | null;
  hero_image_url?: string | null;
  author_name?: string | null;
  published_at?: string | null;
  category_name?: string | null;
  categories?: {
    name?: string | null;
    slug?: string | null;
  } | null;
  [key: string]: unknown;
};

export type CategoryRecord = {
  id?: string | number;
  name?: string | null;
  slug?: string | null;
  [key: string]: unknown;
};

export function firstText(
  record: ArticleRecord | CategoryRecord,
  keys: string[],
  fallback = "",
) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return fallback;
}

export function getArticleHref(article: ArticleRecord) {
  const slug = firstText(article, ["slug"]);

  if (slug) {
    return `/articles/${slug}`;
  }

  return article.id ? `/articles/${article.id}` : "#";
}

export function getArticleImage(article: ArticleRecord) {
  return firstText(article, ["cover_image_url", "image_url", "hero_image_url"]);
}

export function getArticleExcerpt(article: ArticleRecord) {
  return firstText(article, ["excerpt", "summary", "dek"]);
}

export function getArticleCategory(article: ArticleRecord) {
  if (article.categories?.name) {
    return article.categories.name;
  }

  return firstText(article, ["category_name"]);
}

export function formatPublishedDate(date?: string | null) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
