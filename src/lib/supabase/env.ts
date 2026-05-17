export type PublicSupabaseEnv = {
  url: string;
  anonKey: string;
};

import {
  AUTH_DEV_SETUP_HINT,
  AUTH_UNAVAILABLE_MESSAGE,
} from "@/lib/auth/messages";

/** User-facing message when auth is unavailable (safe for production). */
export const SUPABASE_ENV_USER_MESSAGE = AUTH_UNAVAILABLE_MESSAGE;

/** Developer setup hint — show only in development UI. */
export const SUPABASE_ENV_DEV_HINT = AUTH_DEV_SETUP_HINT;

/** @deprecated Use SUPABASE_ENV_USER_MESSAGE or SUPABASE_ENV_DEV_HINT */
export const SUPABASE_ENV_SETUP_HINT = AUTH_UNAVAILABLE_MESSAGE;

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
