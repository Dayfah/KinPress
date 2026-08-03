import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { sanitizeRedirectPath } from "@/lib/auth/routes";
import { ensureUserProfile } from "@/lib/auth/profile";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";

/**
 * Attach Supabase session cookies to a redirect response.
 * Next.js 15+ does not reliably propagate `cookies().set(...)` onto a later
 * `NextResponse.redirect(...)`, so session cookies must be copied explicitly
 * (same pattern as middleware `withSupabaseCookies`).
 */
function redirectWithCookies(
  url: string,
  cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[],
) {
  const response = NextResponse.redirect(url);
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = sanitizeRedirectPath(requestUrl.searchParams.get("next"), "/profile");
  const origin = requestUrl.origin;

  if (!code && !(tokenHash && type)) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const env = getPublicSupabaseEnv();

  if (!env) {
    return NextResponse.redirect(`${origin}/login?error=supabase_config`);
  }

  const cookieStore = await cookies();
  const pendingCookies: {
    name: string;
    value: string;
    options?: Record<string, unknown>;
  }[] = [];

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          pendingCookies.push({ name, value, options });
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Redirect response carries Set-Cookie below.
          }
        });
      },
    },
  });

  const { error } =
    tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : await supabase.auth.exchangeCodeForSession(code!);

  if (error) {
    console.error("[KinPress] auth callback exchange failed", error.message);
    return redirectWithCookies(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
      pendingCookies,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureUserProfile(supabase, user);
  }

  return redirectWithCookies(`${origin}${next}`, pendingCookies);
}
