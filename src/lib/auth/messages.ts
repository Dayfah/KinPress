/** User-facing copy when Supabase is not configured (production-safe). */
export const AUTH_UNAVAILABLE_MESSAGE =
  "Sign-in is temporarily unavailable. Please try again later.";

/** Developer setup hint — only show in development UI. */
export const AUTH_DEV_SETUP_HINT =
  "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (see .env.example), then restart npm run dev.";

const AUTH_ERROR_MAP: Record<string, string> = {
  supabase_config: AUTH_UNAVAILABLE_MESSAGE,
  auth_callback:
    "We could not complete sign-in. Please try again or use email and password.",
  invalid_credentials: "Email or password is incorrect. Please try again.",
  email_not_confirmed:
    "Confirm your email before logging in. Check your inbox for the link.",
};

export function mapSupabaseAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid email or password")
  ) {
    return AUTH_ERROR_MAP.invalid_credentials;
  }

  if (normalized.includes("email not confirmed")) {
    return AUTH_ERROR_MAP.email_not_confirmed;
  }

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Too many attempts. Please wait a few minutes before trying again.";
  }

  if (normalized.includes("signup disabled")) {
    return "Account creation is temporarily disabled. Please contact KinPress support.";
  }

  if (normalized.includes("invalid email")) {
    return "Enter a valid email address.";
  }

  if (normalized.includes("user already registered")) {
    return "An account with this email already exists. Try logging in instead.";
  }

  if (normalized.includes("password")) {
    return "Use a password with at least 6 characters.";
  }

  return message;
}

export function mapAuthPageError(code: string | undefined): string | null {
  if (!code) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(code);
    if (AUTH_ERROR_MAP[decoded]) {
      return AUTH_ERROR_MAP[decoded];
    }
    return mapSupabaseAuthError(decoded);
  } catch {
    return AUTH_ERROR_MAP[code] ?? mapSupabaseAuthError(code);
  }
}
