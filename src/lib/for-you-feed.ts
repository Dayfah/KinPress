import { cache } from "react";

import type { ArticleSummary } from "@/lib/articles";
import { getSavedArticlesForUser } from "@/lib/articles";
import type { ArticleRecord } from "@/lib/content";
import { getArticleCategory } from "@/lib/content";
import { getCachedNewsArticles } from "@/lib/news/cache";
import {
  newsCategoryConfigs,
  parseNewsCategorySlug,
  type NewsCategoryConfig,
} from "@/lib/news/categories";
import { toHomeFeedArticle, type HomeFeedArticle } from "@/lib/news/feed";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ForYouFeed = {
  saved: ArticleSummary[];
  kinpress: ArticleRecord[];
  headlines: HomeFeedArticle[];
  interestLabels: string[];
};

function categorySlugFromName(name: string | null | undefined): string | null {
  if (!name) {
    return null;
  }

  const normalized = name.toLowerCase().trim();
  const match = newsCategoryConfigs.find(
    (config) =>
      config.label.toLowerCase() === normalized ||
      config.slug === normalized.replace(/\s+/g, "-"),
  );

  return match?.slug ?? null;
}

function pickInterestCategories(
  saved: ArticleSummary[],
  recent: ArticleRecord[],
): NewsCategoryConfig[] {
  const slugs = new Set<string>();

  for (const article of saved) {
    const slug = categorySlugFromName(article.categoryName);
    if (slug) {
      slugs.add(slug);
    }
  }

  for (const article of recent.slice(0, 8)) {
    const slug = categorySlugFromName(getArticleCategory(article));
    if (slug) {
      slugs.add(slug);
    }
  }

  if (slugs.size === 0) {
    return newsCategoryConfigs.filter((item) =>
      ["culture", "politics", "business"].includes(item.slug),
    );
  }

  return newsCategoryConfigs.filter((item) => slugs.has(item.slug)).slice(0, 3);
}

export const getForYouFeed = cache(async function getForYouFeed(
  userId: string,
): Promise<ForYouFeed> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { saved: [], kinpress: [], headlines: [], interestLabels: [] };
  }

  const saved = await getSavedArticlesForUser(userId);

  const savedIds = new Set(saved.map((article) => article.id));

  const { data: recentArticles } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(24);

  const recent = (recentArticles ?? []) as ArticleRecord[];
  const interests = pickInterestCategories(saved, recent);

  const categoryNames = new Set(
    saved
      .map((article) => article.categoryName?.toLowerCase())
      .filter((name): name is string => Boolean(name)),
  );

  const kinpress = recent
    .filter((article) => {
      if (savedIds.has(String(article.id))) {
        return false;
      }

      if (categoryNames.size === 0) {
        return true;
      }

      const name = getArticleCategory(article).toLowerCase();
      return categoryNames.has(name);
    })
    .slice(0, 6);

  const headlineBatches = await Promise.all(
    interests.map((config) =>
      getCachedNewsArticles(parseNewsCategorySlug(config.slug)),
    ),
  );

  const headlines: HomeFeedArticle[] = [];
  const seen = new Set<string>();

  for (const batch of headlineBatches) {
    for (const article of batch.articles) {
      const item = toHomeFeedArticle(article);
      if (seen.has(item.id)) {
        continue;
      }
      seen.add(item.id);
      headlines.push(item);
      if (headlines.length >= 9) {
        break;
      }
    }
    if (headlines.length >= 9) {
      break;
    }
  }

  return {
    saved,
    kinpress,
    headlines,
    interestLabels: interests.map((item) => item.label),
  };
});
