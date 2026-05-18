import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { collectPublicEnvIssues } from "@/lib/env/validate";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";

const globalForSupabaseEnv = globalThis as {
  __kinpressMissingSupabaseEnvLogged?: boolean;
};

function warnMissingSupabaseEnvOnce() {
  if (globalForSupabaseEnv.__kinpressMissingSupabaseEnvLogged) {
    return;
  }

  globalForSupabaseEnv.__kinpressMissingSupabaseEnvLogged = true;

  const envErrors = collectPublicEnvIssues().filter((i) => i.severity === "error");
  const message =
    envErrors.length > 0
      ? envErrors.map((i) => i.message).join(" ")
      : "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY.";

  console.warn(`[KinPress] Supabase env: ${message}`);
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
          // Called from a Server Component — middleware refreshes sessions.
        }
      },
    },
  });
}

/** @alias createSupabaseServerClient */
export async function createClient(): Promise<SupabaseClient | null> {
  return createSupabaseServerClient();
}
