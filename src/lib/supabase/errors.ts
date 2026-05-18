/** Safe user-facing message for Supabase/PostgREST failures. */
export function formatSupabaseError(message: string, code?: string | null): string {
  const base = message.trim() || "Something went wrong loading data.";

  if (code === "PGRST116") {
    return "No matching record found.";
  }

  if (code === "42501" || /permission denied|row-level security/i.test(base)) {
    return "You do not have permission to access this data. Check Supabase RLS policies.";
  }

  if (/JWT|invalid api key|apikey/i.test(base)) {
    return "Supabase API key or URL is invalid. Check Vercel environment variables.";
  }

  if (/relation .* does not exist|column .* does not exist/i.test(base)) {
    return "Database schema is out of date. Run KinPress SQL migrations in Supabase.";
  }

  return base;
}
