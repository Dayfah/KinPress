import { cache } from "react";

import type {
  CommunityEvent,
  CommunityOpportunity,
  CommunityResource,
} from "@/lib/community/types";
import { formatSupabaseError } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CommunityResult<T> = {
  items: T[];
  error: string | null;
};

const RESOURCE_COLUMNS = `
  id,
  title,
  organization,
  description,
  category,
  location,
  region,
  eligibility,
  deadline,
  cost,
  format,
  source_url,
  date_verified,
  tags
`;

const OPPORTUNITY_COLUMNS = `
  id,
  title,
  organization,
  description,
  category,
  deadline,
  eligibility,
  amount,
  location,
  region,
  source_url,
  date_verified,
  tags
`;

const EVENT_COLUMNS = `
  id,
  title,
  organizer,
  description,
  category,
  location,
  region,
  starts_at,
  ends_at,
  source_url,
  image_url,
  price,
  tags
`;

export const getResources = cache(async function getResources(
  limit = 24,
): Promise<CommunityResult<CommunityResource>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { items: [], error: null };
  }

  const { data, error } = await supabase
    .from("resources")
    .select(RESOURCE_COLUMNS)
    .eq("status", "published")
    .eq("is_verified", true)
    .order("deadline", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .limit(limit)
    .returns<CommunityResource[]>();

  return {
    items: data ?? [],
    error: error ? formatSupabaseError(error.message, error.code) : null,
  };
});

export const getOpportunities = cache(async function getOpportunities(
  limit = 24,
): Promise<CommunityResult<CommunityOpportunity>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { items: [], error: null };
  }

  const { data, error } = await supabase
    .from("opportunities")
    .select(OPPORTUNITY_COLUMNS)
    .eq("status", "published")
    .eq("is_verified", true)
    .order("deadline", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .limit(limit)
    .returns<CommunityOpportunity[]>();

  return {
    items: data ?? [],
    error: error ? formatSupabaseError(error.message, error.code) : null,
  };
});

export const getEvents = cache(async function getEvents(
  limit = 24,
): Promise<CommunityResult<CommunityEvent>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { items: [], error: null };
  }

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("status", "published")
    .eq("is_verified", true)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true, nullsFirst: false })
    .limit(limit)
    .returns<CommunityEvent[]>();

  return {
    items: data ?? [],
    error: error ? formatSupabaseError(error.message, error.code) : null,
  };
});
