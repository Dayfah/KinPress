"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicSupabaseEnv } from "@/lib/supabase/env";

export function createClient(): SupabaseClient | null {
  const env = getPublicSupabaseEnv();

  if (!env) {
    return null;
  }

  return createBrowserClient(env.url, env.anonKey);
}
