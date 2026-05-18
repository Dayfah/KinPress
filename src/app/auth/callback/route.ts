import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { sanitizeRedirectPath } from "@/lib/auth/routes";
import { ensureUserProfile } from "@/lib/auth/profile";
import { getAuthSiteOrigin, getPublicSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeRedirectPath(requestUrl.searchParams.get("next"), "/profile");
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
    console.error("[KinPress] auth callback exchange failed", error.message);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureUserProfile(supabase, user);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
