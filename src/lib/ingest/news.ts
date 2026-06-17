import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchGuardianItems, fetchNewsApiItems } from "@/lib/ingest/adapters";
import { fetchRssItems, type RssItem } from "@/lib/ingest/rss";
import { slugifyTitle } from "@/lib/editorial/normalize";
import type { ArticleTopic } from "@/lib/editorial/types";

type NewsSource = {
  name: string;
  url: string;
};

const DEFAULT_RSS_SOURCES: NewsSource[] = [
  { name: "Capital B", url: "https://capitalbnews.org/feed/" },
  { name: "Word In Black", url: "https://wordinblack.com/feed/" },
  { name: "TheGrio", url: "https://thegrio.com/feed/" },
  { name: "Black Enterprise", url: "https://www.blackenterprise.com/feed/" },
  { name: "AfroTech", url: "https://afrotech.com/feed/" },
];

type GNewsArticle = {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
  source?: { name?: string };
};

type ExistingArticle = {
  id: string;
  article_kind: string | null;
  author_id: string | null;
};

type UpsertNewsResult = {
  error: { message: string } | null;
  upserted: boolean;
};

const topicKeywords: Array<{ topic: ArticleTopic; keywords: string[] }> = [
  { topic: "politics", keywords: ["election", "voter", "congress", "policy", "mayor"] },
  { topic: "business", keywords: ["business", "founder", "startup", "funding", "wealth"] },
  { topic: "health", keywords: ["health", "medical", "maternal", "clinic", "wellness"] },
  { topic: "justice", keywords: ["justice", "police", "court", "prison", "civil rights"] },
  { topic: "education", keywords: ["school", "student", "hbcu", "college", "education"] },
  { topic: "arts", keywords: ["film", "music", "book", "artist", "museum"] },
  { topic: "history", keywords: ["history", "archive", "legacy", "ancestors"] },
  { topic: "community", keywords: ["community", "local", "neighborhood", "organizer"] },
  { topic: "opinion", keywords: ["opinion", "essay", "column"] },
];

function configuredRssSources() {
  const raw = process.env.KINPRESS_NEWS_RSS_FEEDS?.trim();

  if (!raw) {
    return DEFAULT_RSS_SOURCES;
  }

  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [name, url] = entry.includes("|") ? entry.split("|") : ["", entry];
      return { name: name.trim(), url: url.trim() };
    })
    .filter((source) => source.url);
}

function categorize(item: RssItem): ArticleTopic {
  const haystack = `${item.title} ${item.description}`.toLowerCase();
  const match = topicKeywords.find(({ keywords }) =>
    keywords.some((keyword) => haystack.includes(keyword)),
  );
  return match?.topic ?? "culture";
}

function categoryLabel(topic: ArticleTopic) {
  return topic.charAt(0).toUpperCase() + topic.slice(1);
}

function curatedBody(item: RssItem) {
  return [
    item.description || `${item.sourceName} published this story for readers to review at the source.`,
    `KinPress links to the original reporting and does not republish full articles. Read the complete story at ${item.sourceName}.`,
  ].join("\n\n");
}

async function upsertNewsItem(supabase: SupabaseClient, item: RssItem) {
  const topic = categorize(item);
  const slug = slugifyTitle(`${item.sourceName}-${item.title}`);
  const payload = {
    title: item.title,
    slug,
    excerpt: item.description || `Source summary unavailable. Read the full story at ${item.sourceName}.`,
    summary: item.description || `Source summary unavailable. Read the full story at ${item.sourceName}.`,
    body: curatedBody(item),
    category_name: categoryLabel(topic),
    tags: [topic, "curated", "black-news", "verified-source"],
    author_name: item.sourceName,
    source_name: item.sourceName,
    source_url: item.link,
    cover_image_url: item.imageUrl,
    image_url: item.imageUrl,
    status: "published",
    published_at: item.publishedAt
      ? new Date(item.publishedAt).toISOString()
      : null,
    is_featured: false,
    editor_pick: false,
    reading_time: 2,
    region: "national",
    topic,
    article_kind: "curated_external",
    is_premium: false,
    is_verified: true,
  };
  const { data: existing, error: lookupError } = await supabase
    .from("articles")
    .select("id, article_kind, author_id")
    .eq("source_url", item.link)
    .maybeSingle<ExistingArticle>();

  if (lookupError) {
    return { error: lookupError, upserted: false } satisfies UpsertNewsResult;
  }

  if (existing && !isManagedIngestArticle(existing)) {
    return { error: null, upserted: false } satisfies UpsertNewsResult;
  }

  const { slug: _newSlug, ...updatePayload } = payload;
  const { error } = existing
    ? await supabase.from("articles").update(updatePayload).eq("id", existing.id)
    : await supabase.from("articles").insert(payload);

  return { error, upserted: !error } satisfies UpsertNewsResult;
}

function isManagedIngestArticle(article: ExistingArticle) {
  return article.article_kind === "curated_external" && article.author_id === null;
}

async function fetchGNewsItems(): Promise<RssItem[]> {
  const apiKey = process.env.GNEWS_API_KEY?.trim();

  if (!apiKey) {
    return [];
  }

  const query = encodeURIComponent(
    '"Black Americans" OR "African American" OR HBCU OR "Black business"',
  );
  const response = await fetch(
    `https://gnews.io/api/v4/search?q=${query}&lang=en&country=us&max=25&apikey=${apiKey}`,
    { next: { revalidate: 0 } },
  );

  if (!response.ok) {
    throw new Error(`GNews fetch failed: ${response.status}`);
  }

  const payload = (await response.json()) as { articles?: GNewsArticle[] };

  return (payload.articles ?? [])
    .map((article) => {
      if (!article.title || !article.url) {
        return null;
      }

      return {
        title: article.title,
        link: article.url,
        description: article.description ?? "",
        publishedAt: article.publishedAt ?? null,
        imageUrl: article.image ?? null,
        sourceName: article.source?.name ?? "GNews source",
      };
    })
    .filter((item): item is RssItem => Boolean(item));
}

export async function ingestNews(supabase: SupabaseClient) {
  const sources = configuredRssSources();
  const errors: string[] = [];
  let itemsSeen = 0;
  let itemsUpserted = 0;

  for (const source of sources) {
    try {
      const items = await fetchRssItems(source.url, source.name || undefined);
      itemsSeen += items.length;

      for (const item of items.slice(0, 20)) {
        const result = await upsertNewsItem(supabase, item);

        if (result.error) {
          errors.push(`${item.link}: ${result.error.message}`);
        } else if (result.upserted) {
          itemsUpserted += 1;
        }
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : `Unknown failure for ${source.url}`);
    }
  }

  try {
    const gnewsItems = await fetchGNewsItems();
    itemsSeen += gnewsItems.length;

    for (const item of gnewsItems) {
      const result = await upsertNewsItem(supabase, item);

      if (result.error) {
        errors.push(`${item.link}: ${result.error.message}`);
      } else if (result.upserted) {
        itemsUpserted += 1;
      }
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Unknown GNews failure");
  }

  for (const [label, load] of [
    ["NewsAPI", fetchNewsApiItems],
    ["Guardian", fetchGuardianItems],
  ] as const) {
    try {
      const items = await load();
      itemsSeen += items.length;

      for (const item of items) {
        const result = await upsertNewsItem(supabase, item);

        if (result.error) {
          errors.push(`${item.link}: ${result.error.message}`);
        } else if (result.upserted) {
          itemsUpserted += 1;
        }
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : `Unknown ${label} failure`);
    }
  }

  return { itemsSeen, itemsUpserted, errors };
}
