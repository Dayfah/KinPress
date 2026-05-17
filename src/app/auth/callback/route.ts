import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAuthSiteOrigin, getPublicSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/profile";
  const origin = getAuthSiteOrigin();

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const env = getPublicSupabaseEnv();

  if (!env) {
    return NextResponse.redirect(`${origin}/login?error=supabase_config`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { ensureUserProfile } = await import("@/lib/auth/profile");
    await ensureUserProfile(supabase, user);
  }

  const safeNext = next.startsWith("/") ? next : "/profile";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
