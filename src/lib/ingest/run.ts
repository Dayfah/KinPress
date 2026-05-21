import type { SupabaseClient } from "@supabase/supabase-js";

export type IngestResult = {
  itemsSeen: number;
  itemsUpserted: number;
  errors: string[];
};

export async function recordIngestionRun(
  supabase: SupabaseClient,
  route: string,
  result: IngestResult,
) {
  await supabase.from("ingestion_runs").insert({
    route,
    status: result.errors.length > 0 ? "completed_with_errors" : "completed",
    items_seen: result.itemsSeen,
    items_upserted: result.itemsUpserted,
    errors: result.errors,
  });
}
