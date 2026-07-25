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

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function textValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const nested = textValue(entry);
      if (nested) {
        return nested;
      }
    }
    return "";
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return textValue(record["#text"] ?? record._ ?? record.value);
  }

  return "";
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    const text = textValue(value);
    if (text) {
      return text;
    }
  }
  return "";
}

function pickLink(link: unknown) {
  const candidates = asArray(link as { href?: string; rel?: string } | string | undefined);
  const normalized = candidates
    .map((candidate) => {
      if (typeof candidate === "string") {
        return { href: normalizeUrl(candidate), rel: "" };
      }

      if (candidate && typeof candidate === "object") {
        return {
          href: normalizeUrl(candidate.href),
          rel: typeof candidate.rel === "string" ? candidate.rel.toLowerCase() : "",
        };
      }

      return { href: null as string | null, rel: "" };
    })
    .filter((candidate): candidate is { href: string; rel: string } => Boolean(candidate.href));

  return (
    normalized.find((candidate) => !candidate.rel || candidate.rel === "alternate")?.href ??
    normalized[0]?.href ??
    null
  );
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
      const link = pickLink(item.link);
      const title = cleanText(firstString(item.title), 160);

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
