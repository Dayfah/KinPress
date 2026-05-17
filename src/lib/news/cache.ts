import { unstable_cache } from "next/cache";

import { fetchNewsArticles } from "@/lib/news/gnews";
import type { NewsCategorySlug, NewsFetchResult } from "@/lib/news/types";

const REVALIDATE_SECONDS = 1800;

export function getCachedNewsArticles(category: NewsCategorySlug) {
  return unstable_cache(
    async () => fetchNewsArticles(category),
    ["kinpress-news", category],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: [`news-${category}`],
    },
  )();
}

export type { NewsFetchResult };
