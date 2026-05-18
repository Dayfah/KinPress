import type { ArticleRail, ArticleTopic, EditorialArticle } from "@/lib/editorial/types";

type RailConfig = {
  id: string;
  title: string;
  topics: ArticleTopic[];
  limit?: number;
};

const RAIL_CONFIGS: RailConfig[] = [
  { id: "latest", title: "Latest News", topics: [], limit: 8 },
  {
    id: "culture-arts",
    title: "Culture & Arts",
    topics: ["culture", "arts"],
    limit: 6,
  },
  {
    id: "politics-justice",
    title: "Politics & Justice",
    topics: ["politics", "justice"],
    limit: 6,
  },
  {
    id: "business-work",
    title: "Business & Work",
    topics: ["business"],
    limit: 6,
  },
  {
    id: "history-archive",
    title: "History & Archive",
    topics: ["history"],
    limit: 6,
  },
  {
    id: "community-voices",
    title: "Community Voices",
    topics: ["community", "opinion", "education", "health"],
    limit: 6,
  },
];

export function buildHomepageRails(
  articles: EditorialArticle[],
  excludeIds: Set<string | undefined>,
): ArticleRail[] {
  const pool = articles.filter((article) => !excludeIds.has(article.id));

  return RAIL_CONFIGS.map((config) => {
    const filtered =
      config.topics.length === 0
        ? pool
        : pool.filter((article) => config.topics.includes(article.topic));

    const unique = filtered.slice(0, config.limit ?? 6);

    return {
      id: config.id,
      title: config.title,
      articles: unique,
    };
  }).filter((rail) => rail.articles.length > 0);
}
