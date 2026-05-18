"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicSupabaseEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient | null | undefined;

/**
 * Browser Supabase client (@supabase/ssr).
 * Returns null when public env is missing — never throws.
 */
export function createClient(): SupabaseClient | null {
  const env = getPublicSupabaseEnv();

  if (!env) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(env.url, env.anonKey);
  }

  return browserClient;
}

/** Reset singleton (tests / env hot reload in dev). */
export function resetBrowserClient() {
  browserClient = undefined;
}
