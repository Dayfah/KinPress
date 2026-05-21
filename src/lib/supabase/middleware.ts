import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  isAdminPath,
  isAuthGuestPath,
  isAuthProtectedPath,
  sanitizeRedirectPath,
} from "@/lib/auth/routes";
import { getMiddlewareSupabaseConfig } from "@/lib/supabase/middleware-env";

function nextPassthrough(request: NextRequest) {
  return NextResponse.next({ request });
}

/** Copy refreshed auth cookies onto redirect responses (required by @supabase/ssr). */
function withSupabaseCookies(
  target: NextResponse,
  source: NextResponse,
): NextResponse {
  source.cookies.getAll().forEach(({ name, value, ...options }) => {
    target.cookies.set(name, value, options);
  });
  return target;
}

function redirectToLogin(
  request: NextRequest,
  supabaseResponse: NextResponse,
) {
  const url = request.nextUrl.clone();
  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", next);
  return withSupabaseCookies(NextResponse.redirect(url), supabaseResponse);
}

/**
 * Refreshes the Supabase session and applies route guards.
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function updateSession(request: NextRequest) {
  const config = getMiddlewareSupabaseConfig();

  if (!config) {
    return nextPassthrough(request);
  }

  let supabaseResponse = nextPassthrough(request);

  try {
    const supabase = createServerClient(config.url, config.anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = nextPassthrough(request);
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    // Do not add logic between createServerClient and getUser — required for session refresh.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;
    const isLoggedIn = Boolean(user);

    if (isLoggedIn && isAuthGuestPath(pathname)) {
      const next = sanitizeRedirectPath(
        request.nextUrl.searchParams.get("next"),
        "/profile",
      );
      const url = request.nextUrl.clone();
      url.pathname = next;
      url.search = "";
      return withSupabaseCookies(NextResponse.redirect(url), supabaseResponse);
    }

    if (!isLoggedIn && (isAuthProtectedPath(pathname) || isAdminPath(pathname))) {
      return redirectToLogin(request, supabaseResponse);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("[KinPress] middleware session refresh failed", error);
    return nextPassthrough(request);
  }
}
