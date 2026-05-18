import {
  AUTH_DEV_SETUP_HINT,
  AUTH_UNAVAILABLE_MESSAGE,
} from "@/lib/auth/messages";
import {
  collectPublicEnvIssues,
  isPublicSupabaseEnvUsable,
  type EnvIssue,
} from "@/lib/env/validate";

export type PublicSupabaseEnv = {
  url: string;
  anonKey: string;
};

/** User-facing message when auth is unavailable (safe for production). */
export const SUPABASE_ENV_USER_MESSAGE = AUTH_UNAVAILABLE_MESSAGE;

/** Developer setup hint — show only in development UI. */
export const SUPABASE_ENV_DEV_HINT = AUTH_DEV_SETUP_HINT;

/** @deprecated Use SUPABASE_ENV_USER_MESSAGE or SUPABASE_ENV_DEV_HINT */
export const SUPABASE_ENV_SETUP_HINT = AUTH_UNAVAILABLE_MESSAGE;

/**
 * Reads public Supabase credentials from NEXT_PUBLIC_* env vars.
 * Prefers NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Returns null when missing, invalid, or unsafe (never throws).
 */
export function getPublicSupabaseEnv(): PublicSupabaseEnv | null {
  if (!isPublicSupabaseEnvUsable()) {
    return null;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const anonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )!.trim();

  return { url, anonKey };
}

export function getPublicEnvIssues(): EnvIssue[] {
  return collectPublicEnvIssues();
}

export function isSupabaseConfigured(): boolean {
  return getPublicSupabaseEnv() !== null;
}

/** Origin for auth redirects (OAuth, email confirmation). Never throws. */
export function getAuthSiteOrigin(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) {
    try {
      const parsed = new URL(siteUrl);
      return parsed.origin;
    } catch {
      // fall through
    }
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
