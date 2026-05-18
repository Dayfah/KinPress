import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicSupabaseEnv } from "@/lib/supabase/env";

const globalForSupabaseEnv = globalThis as {
  __kinpressMissingSupabaseEnvLogged?: boolean;
};

function warnMissingSupabaseEnvOnce() {
  if (globalForSupabaseEnv.__kinpressMissingSupabaseEnvLogged) {
    return;
  }

  globalForSupabaseEnv.__kinpressMissingSupabaseEnvLogged = true;

  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[KinPress] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY. Supabase-backed routes will degrade until env vars are set.",
    );
  }
}

export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  const env = getPublicSupabaseEnv();

  if (!env) {
    warnMissingSupabaseEnvOnce();
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components cannot set cookies; route handlers and middleware can.
        }
      },
    },
  });
}

/** Returns a Supabase server client or null when env vars are missing (no throw). */
export async function createClient(): Promise<SupabaseClient | null> {
  return createSupabaseServerClient();
}
