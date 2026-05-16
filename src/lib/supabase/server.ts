import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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
      "[KinPress] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Server data loaders that use createSupabaseServerClient() will return empty results.",
    );
  }
}

export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    warnMissingSupabaseEnvOnce();
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
          // Server components cannot set cookies; route handlers can.
        }
      },
    },
  });
}

export async function createClient() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Missing Supabase environment variables.");
  }

  return supabase;
}
