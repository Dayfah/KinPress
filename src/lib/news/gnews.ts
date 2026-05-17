import { createHash } from "crypto";

import { getNewsCategoryConfig } from "@/lib/news/categories";
import { getMockNewsArticles } from "@/lib/news/mock-articles";
import type {
  NewsCategorySlug,
  NewsFetchResult,
  NormalizedNewsArticle,
} from "@/lib/news/types";

const GNEWS_BASE = "https://gnews.io/api/v4";
const MAX_ARTICLES = 20;
const REQUEST_TIMEOUT_MS = 12_000;

type GNewsArticle = {
  id?: string;
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
  source?: { name?: string };
};

type GNewsResponse = {
  totalArticles?: number;
  articles?: GNewsArticle[];
  errors?: string[];
};

function getApiKey() {
  return process.env.GNEWS_API_KEY?.trim() ?? "";
}

function stableId(article: GNewsArticle, index: number) {
  if (article.id) {
    return String(article.id);
  }

  if (article.url) {
    return createHash("sha256").update(article.url).digest("hex").slice(0, 24);
  }

  return `gnews-${index}-${Date.now()}`;
}

function normalizeArticle(
  article: GNewsArticle,
  index: number,
  categoryLabel: string,
): NormalizedNewsArticle | null {
  const title = article.title?.trim();
  const url = article.url?.trim();

  if (!title || !url) {
    return null;
  }

  const description =
    article.description?.trim() ||
    article.content?.trim().slice(0, 280) ||
    "Read the full story at the source.";

  return {
    id: stableId(article, index),
    title,
    description,
    url,
    imageUrl: article.image?.trim() || null,
    source: article.source?.name?.trim() || "News",
    author: article.source?.name?.trim() || "Staff",
    publishedAt: article.publishedAt ?? new Date().toISOString(),
    category: categoryLabel,
  };
}

async function fetchGNewsUrl(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error(`GNews HTTP ${response.status}`);
    }

    return (await response.json()) as GNewsResponse;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFromSearch(query: string, categoryLabel: string) {
  const apiKey = getApiKey();
  const params = new URLSearchParams({
    q: query,
    lang: "en",
    country: "us",
    max: String(MAX_ARTICLES),
    sortby: "publishedAt",
    apikey: apiKey,
  });

  const payload = await fetchGNewsUrl(`${GNEWS_BASE}/search?${params.toString()}`);

  if (payload.errors?.length) {
    throw new Error(payload.errors.join(", "));
  }

  return (payload.articles ?? [])
    .map((article, index) => normalizeArticle(article, index, categoryLabel))
    .filter((article): article is NormalizedNewsArticle => Boolean(article));
}

async function fetchFromTopHeadlines(
  headlineCategory: string,
  categoryLabel: string,
) {
  const apiKey = getApiKey();
  const params = new URLSearchParams({
    category: headlineCategory,
    lang: "en",
    country: "us",
    max: String(MAX_ARTICLES),
    apikey: apiKey,
  });

  const payload = await fetchGNewsUrl(
    `${GNEWS_BASE}/top-headlines?${params.toString()}`,
  );

  if (payload.errors?.length) {
    throw new Error(payload.errors.join(", "));
  }

  return (payload.articles ?? [])
    .map((article, index) => normalizeArticle(article, index, categoryLabel))
    .filter((article): article is NormalizedNewsArticle => Boolean(article));
}

export async function fetchNewsFromGNews(
  category: NewsCategorySlug,
): Promise<NormalizedNewsArticle[]> {
  const config = getNewsCategoryConfig(category);

  if (category === "top-stories" && config.headlineCategory) {
    try {
      const headlines = await fetchFromTopHeadlines(
        config.headlineCategory,
        config.label,
      );

      if (headlines.length >= 6) {
        return headlines;
      }
    } catch (error) {
      console.error("[KinPress] GNews top-headlines failed", error);
    }
  }

  return fetchFromSearch(config.query, config.label);
}

export async function fetchNewsArticles(
  category: NewsCategorySlug,
): Promise<NewsFetchResult> {
  const apiKey = getApiKey();

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[KinPress] GNEWS_API_KEY is missing — using mock news articles.");
    }

    return {
      articles: getMockNewsArticles(category),
      source: "mock",
      category,
    };
  }

  try {
    const articles = await fetchNewsFromGNews(category);

    if (articles.length === 0) {
      throw new Error("GNews returned no articles");
    }

    return { articles, source: "gnews", category };
  } catch (error) {
    console.error("[KinPress] News fetch failed, using mock fallback", error);

    return {
      articles: getMockNewsArticles(category),
      source: "mock",
      category,
    };
  }
}
