import { NextResponse } from "next/server";

import { verifyCronRequest } from "@/lib/ingest/auth";
import { ingestCommunityFeed } from "@/lib/ingest/community";
import { recordIngestionRun } from "@/lib/ingest/run";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const authError = verifyCronRequest(request);
  if (authError) {
    return authError;
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase service role is not configured." },
      { status: 503 },
    );
  }

  const result = await ingestCommunityFeed(supabase, "events", "KINPRESS_EVENT_FEED_URLS");
  await recordIngestionRun(supabase, "/api/ingest/events", result);

  return NextResponse.json({ ok: result.errors.length === 0, ...result });
}

export const GET = POST;
