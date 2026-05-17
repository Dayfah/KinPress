export type PublicSupabaseEnv = {
  url: string;
  anonKey: string;
};

/** Developer-facing copy when public Supabase env vars are missing at build/runtime. */
export const SUPABASE_ENV_SETUP_HINT =
  "Authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project settings (Environment Variables), then redeploy.";

/**
 * Reads public Supabase credentials from NEXT_PUBLIC_* env vars.
 * Prefers NEXT_PUBLIC_SUPABASE_ANON_KEY; falls back to NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
 */
export function getPublicSupabaseEnv(): PublicSupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getPublicSupabaseEnv() !== null;
}

/** Origin for auth redirects (OAuth, email confirmation). */
export function getAuthSiteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
    return process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim()}`;
  }

  return "http://localhost:3000";
}

export function getAuthCallbackUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return `${window.location.origin}/auth/callback`;
  }

  return `${getAuthSiteOrigin()}/auth/callback`;
}
