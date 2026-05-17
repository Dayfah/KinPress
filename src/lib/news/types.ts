export const NEWS_CATEGORY_SLUGS = [
  "top-stories",
  "culture",
  "politics",
  "local",
  "business",
  "arts",
  "history",
  "opinion",
] as const;

export type NewsCategorySlug = (typeof NEWS_CATEGORY_SLUGS)[number];

export type NormalizedNewsArticle = {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  source: string;
  author: string;
  publishedAt: string;
  category: string;
};

export type NewsFetchResult = {
  articles: NormalizedNewsArticle[];
  source: "gnews" | "mock";
  category: NewsCategorySlug;
};
