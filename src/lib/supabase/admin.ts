import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type AdminEnv = {
  url: string;
  serviceRoleKey: string;
};

let adminClient: SupabaseClient | null | undefined;

function getAdminEnv(): AdminEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    return null;
  }

  try {
    new URL(url);
  } catch {
    return null;
  }

  return { url, serviceRoleKey };
}

export function createSupabaseAdminClient(): SupabaseClient | null {
  const env = getAdminEnv();

  if (!env) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(env.url, env.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
