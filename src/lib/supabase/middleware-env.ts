/**
 * Edge-safe Supabase env for middleware only.
 * No imports from validate.ts, server.ts, or auth modules.
 */

export type MiddlewareSupabaseConfig = {
  url: string;
  anonKey: string;
};

export function getMiddlewareSupabaseConfig(): MiddlewareSupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();

  if (!url || !anonKey) {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
  } catch {
    return null;
  }

  return { url, anonKey };
}
