import { cleanText, normalizeUrl, sourceNameFromUrl } from "@/lib/ingest/text";
import type { RssItem } from "@/lib/ingest/rss";

type NewsApiArticle = {
  title?: string;
  description?: string | null;
  url?: string;
  urlToImage?: string | null;
  publishedAt?: string;
  source?: { name?: string };
  author?: string | null;
};

type GuardianResult = {
  webTitle?: string;
  webUrl?: string;
  webPublicationDate?: string;
  sectionName?: string;
  fields?: {
    trailText?: string;
    thumbnail?: string;
    byline?: string;
  };
};

type GrantsGovOpportunity = {
  id?: string;
  title?: string;
  agency?: string;
  closeDate?: string;
  openDate?: string;
  opportunityNumber?: string;
  opportunityCategory?: string;
  awardFloor?: string;
  awardCeiling?: string;
};

type EventbriteEvent = {
  name?: { text?: string };
  description?: { text?: string };
  url?: string;
  start?: { utc?: string; local?: string };
  end?: { utc?: string; local?: string };
  organization_id?: string;
  logo?: { url?: string };
  is_free?: boolean;
  venue?: { address?: { localized_address_display?: string } };
};

function dateOnlyOrNull(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const slashDate = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (slashDate) {
    const [, monthValue, dayValue, yearValue] = slashDate;
    const month = Number(monthValue);
    const day = Number(dayValue);
    const year = Number(yearValue);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    ) {
      return date.toISOString().slice(0, 10);
    }

    return null;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString().slice(0, 10);
}

function toRssItem(
  title: unknown,
  link: unknown,
  options: {
    description?: unknown;
    imageUrl?: unknown;
    publishedAt?: unknown;
    sourceName?: unknown;
  } = {},
): RssItem | null {
  const normalizedLink = normalizeUrl(link);
  const cleanTitle = cleanText(title, 180);

  if (!normalizedLink || !cleanTitle) {
    return null;
  }

  return {
    title: cleanTitle,
    link: normalizedLink,
    description: cleanText(options.description, 320),
    publishedAt:
      typeof options.publishedAt === "string" && options.publishedAt.trim()
        ? options.publishedAt
        : null,
    imageUrl: normalizeUrl(options.imageUrl),
    sourceName:
      (typeof options.sourceName === "string" && cleanText(options.sourceName, 80)) ||
      sourceNameFromUrl(normalizedLink),
  };
}

export async function fetchNewsApiItems(): Promise<RssItem[]> {
  const apiKey = process.env.NEWS_API_KEY?.trim();
  if (!apiKey) {
    return [];
  }

  const query = encodeURIComponent(
    '("Black Americans" OR "African American" OR HBCU OR "Black business" OR "racial justice")',
  );
  const response = await fetch(
    `https://newsapi.org/v2/everything?q=${query}&language=en&pageSize=40&sortBy=publishedAt&apiKey=${apiKey}`,
    { next: { revalidate: 0 } },
  );

  if (!response.ok) {
    throw new Error(`NewsAPI fetch failed: ${response.status}`);
  }

  const payload = (await response.json()) as { articles?: NewsApiArticle[] };
  return (payload.articles ?? [])
    .map((article) =>
      toRssItem(article.title, article.url, {
        description: article.description,
        imageUrl: article.urlToImage,
        publishedAt: article.publishedAt,
        sourceName: article.source?.name,
      }),
    )
    .filter((item): item is RssItem => Boolean(item));
}

export async function fetchGuardianItems(): Promise<RssItem[]> {
  const apiKey = process.env.GUARDIAN_API_KEY?.trim();
  if (!apiKey) {
    return [];
  }

  const query = encodeURIComponent('"Black Americans" OR "African American" OR race OR HBCU');
  const response = await fetch(
    `https://content.guardianapis.com/search?q=${query}&show-fields=trailText,thumbnail,byline&page-size=40&api-key=${apiKey}`,
    { next: { revalidate: 0 } },
  );

  if (!response.ok) {
    throw new Error(`Guardian fetch failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    response?: { results?: GuardianResult[] };
  };

  return (payload.response?.results ?? [])
    .map((result) =>
      toRssItem(result.webTitle, result.webUrl, {
        description: result.fields?.trailText,
        imageUrl: result.fields?.thumbnail,
        publishedAt: result.webPublicationDate,
        sourceName: "The Guardian",
      }),
    )
    .filter((item): item is RssItem => Boolean(item));
}

export async function fetchGrantsGovOpportunities() {
  const enabled = process.env.GRANTS_GOV_ENABLED === "true";
  if (!enabled) {
    return [];
  }

  const response = await fetch("https://api.grants.gov/v1/api/search2", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "KinPress/1.0 (+https://kin-press.vercel.app)",
    },
    body: JSON.stringify({
      rows: 25,
      keyword: "Black OR minority OR HBCU OR underserved",
      oppStatuses: "forecasted|posted",
    }),
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Grants.gov fetch failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: { oppHits?: GrantsGovOpportunity[] };
  };

  return (payload.data?.oppHits ?? [])
    .map((grant) => {
      const id = cleanText(grant.id ?? grant.opportunityNumber, 80);
      const title = cleanText(grant.title, 180);

      if (!id || !title) {
        return null;
      }

      return {
        title,
        organization: cleanText(grant.agency, 160) || "Grants.gov",
        description: `Federal opportunity listed by Grants.gov${grant.opportunityNumber ? ` (${grant.opportunityNumber})` : ""}. Review eligibility and application instructions at the source.`,
        category: cleanText(grant.opportunityCategory, 80) || "grants",
        deadline: dateOnlyOrNull(grant.closeDate),
        eligibility: "See official Grants.gov listing.",
        amount:
          grant.awardFloor || grant.awardCeiling
            ? [grant.awardFloor, grant.awardCeiling].filter(Boolean).join(" - ")
            : null,
        location: "United States",
        region: "national",
        source_url: `https://www.grants.gov/search-results-detail/${id}`,
        date_verified: new Date().toISOString().slice(0, 10),
        tags: ["grants", "federal", "verified"],
        is_verified: true,
        status: "published",
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export async function fetchEventbriteEvents() {
  const token = process.env.EVENTBRITE_API_KEY?.trim();
  if (!token) {
    return [];
  }

  const query = encodeURIComponent("Black community culture business education");
  const response = await fetch(
    `https://www.eventbriteapi.com/v3/events/search/?q=${query}&sort_by=date&expand=venue`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "user-agent": "KinPress/1.0 (+https://kin-press.vercel.app)",
      },
      next: { revalidate: 0 },
    },
  );

  if (!response.ok) {
    throw new Error(`Eventbrite fetch failed: ${response.status}`);
  }

  const payload = (await response.json()) as { events?: EventbriteEvent[] };

  return (payload.events ?? [])
    .map((event) => {
      const sourceUrl = normalizeUrl(event.url);
      const title = cleanText(event.name?.text, 180);
      const description = cleanText(event.description?.text, 500);

      if (!sourceUrl || !title || !description) {
        return null;
      }

      return {
        title,
        organizer: "Eventbrite organizer",
        description,
        category: "events",
        location: event.venue?.address?.localized_address_display ?? null,
        region: "local",
        starts_at: event.start?.utc ?? event.start?.local ?? null,
        ends_at: event.end?.utc ?? event.end?.local ?? null,
        source_url: sourceUrl,
        image_url: normalizeUrl(event.logo?.url),
        price: event.is_free ? "Free" : "See source",
        tags: ["events", "community", "verified"],
        is_verified: true,
        status: "published",
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}
