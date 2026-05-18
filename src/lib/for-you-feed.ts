import { cache } from "react";

import { getSavedEditorialArticles } from "@/lib/editorial/saved";
import { normalizeArticle, type ArticleRow } from "@/lib/editorial/normalize";
import type { EditorialArticle, ArticleTopic } from "@/lib/editorial/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ForYouFeed = {
  saved: EditorialArticle[];
  recommended: EditorialArticle[];
  interestLabels: string[];
};

const ARTICLE_SELECT = `
  id,
  slug,
  title,
  subtitle,
  summary,
  excerpt,
  body,
  category_name,
  tags,
  author_name,
  source_name,
  source_url,
  cover_image_url,
  image_url,
  published_at,
  updated_at,
  status,
  is_featured,
  editor_pick,
  reading_time,
  region,
  topic,
  article_kind,
  is_premium
`;

function topicLabels(topics: ArticleTopic[]) {
  const labels: Record<ArticleTopic, string> = {
    politics: "Politics",
    culture: "Culture",
    history: "History",
    business: "Business",
    arts: "Arts",
    justice: "Justice",
    education: "Education",
    health: "Health",
    community: "Community",
    opinion: "Opinion",
  };
  return topics.map((topic) => labels[topic]);
}

export const getForYouFeed = cache(async function getForYouFeed(
  userId: string,
): Promise<ForYouFeed> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { saved: [], recommended: [], interestLabels: [] };
  }

  const saved = await getSavedEditorialArticles(userId);
  const savedIds = new Set(saved.map((article) => article.id));
  const topics = new Set<ArticleTopic>();

  for (const article of saved) {
    topics.add(article.topic);
  }

  if (topics.size === 0) {
    topics.add("culture");
    topics.add("politics");
    topics.add("community");
  }

  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .in("topic", [...topics])
    .order("published_at", { ascending: false })
    .limit(24)
    .returns<ArticleRow[]>();

  if (error) {
    console.error("[KinPress] getForYouFeed", error.message);
    return { saved, recommended: [], interestLabels: topicLabels([...topics]) };
  }

  const recommended = (data ?? [])
    .map(normalizeArticle)
    .filter((article) => !savedIds.has(article.id))
    .slice(0, 9);

  return {
    saved,
    recommended,
    interestLabels: topicLabels([...topics]),
  };
});
