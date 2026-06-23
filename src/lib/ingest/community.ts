import type { SupabaseClient } from "@supabase/supabase-js";

import {
  fetchEventbriteEvents,
  fetchGrantsGovOpportunities,
} from "@/lib/ingest/adapters";
import { isIngestionManagedCommunityRecord } from "@/lib/ingest/managed-records";
import { cleanText, normalizeUrl } from "@/lib/ingest/text";

type CommunityKind = "resources" | "opportunities" | "events";

type IncomingCommunityRecord = {
  title?: unknown;
  organization?: unknown;
  organizer?: unknown;
  description?: unknown;
  category?: unknown;
  location?: unknown;
  region?: unknown;
  eligibility?: unknown;
  deadline?: unknown;
  amount?: unknown;
  cost?: unknown;
  format?: unknown;
  source_url?: unknown;
  url?: unknown;
  date_verified?: unknown;
  starts_at?: unknown;
  ends_at?: unknown;
  image_url?: unknown;
  price?: unknown;
  tags?: unknown;
};

type CommunityPayload = Record<string, unknown> & {
  source_url: string;
};

type IngestWriteResult =
  | { status: "upserted" }
  | { status: "skipped" }
  | { status: "error"; message: string };

function configuredFeeds(envName: string) {
  return (process.env[envName] ?? "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
}

function stringOrNull(value: unknown, maxLength = 200) {
  const text = cleanText(value, maxLength);
  return text || null;
}

function dateOrNull(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

function dateOnlyOrNull(value: unknown) {
  const iso = dateOrNull(value);
  return iso ? iso.slice(0, 10) : null;
}

function tags(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((tag) => cleanText(tag, 40)).filter(Boolean).slice(0, 8);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => cleanText(tag, 40))
      .filter(Boolean)
      .slice(0, 8);
  }

  return [];
}

function normalizeRecord(
  kind: CommunityKind,
  record: IncomingCommunityRecord,
): CommunityPayload | null {
  const sourceUrl = normalizeUrl(record.source_url ?? record.url);
  const title = cleanText(record.title, 180);
  const description = cleanText(record.description, 500);

  if (!sourceUrl || !title || !description) {
    return null;
  }

  const common = {
    title,
    description,
    category: stringOrNull(record.category, 80) ?? "community",
    location: stringOrNull(record.location, 120),
    region: stringOrNull(record.region, 80) ?? "national",
    source_url: sourceUrl,
    date_verified: dateOnlyOrNull(record.date_verified) ?? new Date().toISOString().slice(0, 10),
    tags: tags(record.tags),
    is_verified: true,
    status: "published",
  };

  if (kind === "events") {
    return {
      ...common,
      organizer: stringOrNull(record.organizer ?? record.organization, 160),
      starts_at: dateOrNull(record.starts_at),
      ends_at: dateOrNull(record.ends_at),
      image_url: normalizeUrl(record.image_url),
      price: stringOrNull(record.price ?? record.cost, 80),
    };
  }

  if (kind === "opportunities") {
    return {
      ...common,
      organization: stringOrNull(record.organization, 160),
      deadline: dateOnlyOrNull(record.deadline),
      eligibility: stringOrNull(record.eligibility, 260),
      amount: stringOrNull(record.amount, 80),
    };
  }

  return {
    ...common,
    organization: stringOrNull(record.organization, 160),
    eligibility: stringOrNull(record.eligibility, 260),
    deadline: dateOnlyOrNull(record.deadline),
    cost: stringOrNull(record.cost, 80),
    format: stringOrNull(record.format, 80),
  };
}

async function fetchJsonFeed(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "KinPress/1.0 (+https://kin-press.vercel.app)",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Feed fetch failed for ${url}: ${response.status}`);
  }

  const data = (await response.json()) as unknown;
  if (Array.isArray(data)) {
    return data as IncomingCommunityRecord[];
  }

  if (data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: IncomingCommunityRecord[] }).items;
  }

  return [];
}

async function upsertCommunityRecord(
  supabase: SupabaseClient,
  kind: CommunityKind,
  payload: CommunityPayload,
): Promise<IngestWriteResult> {
  const { data: existing, error: lookupError } = await supabase
    .from(kind)
    .select("id, created_by, status")
    .eq("source_url", payload.source_url)
    .maybeSingle<{
      id: string;
      created_by: string | null;
      status: string | null;
    }>();

  if (lookupError) {
    return { status: "error", message: lookupError.message };
  }

  if (existing && !isIngestionManagedCommunityRecord(existing)) {
    return { status: "skipped" };
  }

  const { error } = existing
    ? await supabase.from(kind).update(payload as never).eq("id", existing.id)
    : await supabase.from(kind).insert(payload as never);

  if (error) {
    return { status: "error", message: error.message };
  }

  return { status: "upserted" };
}

export async function ingestCommunityFeed(
  supabase: SupabaseClient,
  kind: CommunityKind,
  envName: string,
) {
  const feeds = configuredFeeds(envName);
  const errors: string[] = [];
  let itemsSeen = 0;
  let itemsUpserted = 0;
  let itemsSkipped = 0;

  for (const feed of feeds) {
    try {
      const records = await fetchJsonFeed(feed);
      itemsSeen += records.length;

      for (const record of records) {
        const payload = normalizeRecord(kind, record);

        if (!payload) {
          continue;
        }

        const result = await upsertCommunityRecord(supabase, kind, payload);

        if (result.status === "error") {
          errors.push(`${payload.source_url}: ${result.message}`);
        } else if (result.status === "skipped") {
          itemsSkipped += 1;
        } else {
          itemsUpserted += 1;
        }
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : `Unknown failure for ${feed}`);
    }
  }

  try {
    const adapterRecords =
      kind === "opportunities"
        ? await fetchGrantsGovOpportunities()
        : kind === "events"
          ? await fetchEventbriteEvents()
          : [];

    itemsSeen += adapterRecords.length;

    for (const record of adapterRecords) {
      const result = await upsertCommunityRecord(
        supabase,
        kind,
        record as CommunityPayload,
      );

      if (result.status === "error") {
        errors.push(`${record.source_url}: ${result.message}`);
      } else if (result.status === "skipped") {
        itemsSkipped += 1;
      } else {
        itemsUpserted += 1;
      }
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : `Unknown ${kind} adapter failure`);
  }

  return { itemsSeen, itemsUpserted, itemsSkipped, errors };
}
