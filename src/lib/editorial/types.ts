export const ARTICLE_STATUSES = ["draft", "published"] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const ARTICLE_REGIONS = ["national", "local", "global", "diaspora"] as const;
export type ArticleRegion = (typeof ARTICLE_REGIONS)[number];

export const ARTICLE_TOPICS = [
  "politics",
  "culture",
  "history",
  "business",
  "tech",
  "arts",
  "justice",
  "education",
  "health",
  "community",
  "local",
  "opinion",
] as const;
export type ArticleTopic = (typeof ARTICLE_TOPICS)[number];

export const ARTICLE_KINDS = ["kinpress_original", "curated_external"] as const;
export type ArticleKind = (typeof ARTICLE_KINDS)[number];

export type EditorialArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  categorySlug: string;
  tags: string[];
  author: string;
  sourceName: string | null;
  sourceUrl: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  status: ArticleStatus;
  featured: boolean;
  editorPick: boolean;
  readingTime: number;
  region: ArticleRegion;
  topic: ArticleTopic;
  kind: ArticleKind;
  isPremium: boolean;
  isVerified: boolean;
  href: string;
  isExternal: boolean;
};

export type ArticleRail = {
  id: string;
  title: string;
  articles: EditorialArticle[];
};

export type HomepageHero = {
  lead: EditorialArticle | null;
  secondary: EditorialArticle[];
};

export type HomepageData = {
  hero: HomepageHero;
  rails: ArticleRail[];
};
