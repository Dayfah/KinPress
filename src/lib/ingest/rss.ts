import { XMLParser } from "fast-xml-parser";

import { cleanText, normalizeUrl, sourceNameFromUrl } from "@/lib/ingest/text";

export type RssItem = {
  title: string;
  link: string;
  description: string;
  publishedAt: string | null;
  imageUrl: string | null;
  sourceName: string;
};

const parser = new XMLParser({
  attributeNamePrefix: "",
  ignoreAttributes: false,
  parseTagValue: false,
  trimValues: true,
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function pickImage(item: Record<string, unknown>) {
  const mediaContent = item["media:content"] as { url?: string } | { url?: string }[] | undefined;
  const mediaThumbnail = item["media:thumbnail"] as { url?: string } | { url?: string }[] | undefined;
  const enclosure = item.enclosure as { url?: string; type?: string } | undefined;
  const media = asArray(mediaContent)[0] ?? asArray(mediaThumbnail)[0];

  return normalizeUrl(media?.url) ?? normalizeUrl(enclosure?.url);
}

export async function fetchRssItems(feedUrl: string, sourceName?: string): Promise<RssItem[]> {
  const response = await fetch(feedUrl, {
    headers: {
      "user-agent": "KinPress/1.0 (+https://kin-press.vercel.app)",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`RSS fetch failed for ${feedUrl}: ${response.status}`);
  }

  const xml = await response.text();
  const parsed = parser.parse(xml) as {
    rss?: { channel?: { item?: Record<string, unknown>[] | Record<string, unknown> } };
    feed?: { entry?: Record<string, unknown>[] | Record<string, unknown> };
  };
  const items = asArray(parsed.rss?.channel?.item ?? parsed.feed?.entry);

  return items
    .map((item) => {
      const linkValue =
        typeof item.link === "object" && item.link !== null
          ? (item.link as { href?: string }).href
          : item.link;
      const link = normalizeUrl(linkValue);
      const title = cleanText(item.title, 160);

      if (!link || !title) {
        return null;
      }

      return {
        title,
        link,
        description: cleanText(
          firstString(item.description, item.summary, item.content, item["content:encoded"]),
          320,
        ),
        publishedAt:
          firstString(item.pubDate, item.published, item.updated, item.isoDate) || null,
        imageUrl: pickImage(item),
        sourceName: sourceName || sourceNameFromUrl(link),
      };
    })
    .filter((item): item is RssItem => Boolean(item));
}
