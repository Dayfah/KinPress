export const AUTH_GUEST_PATHS = ["/login", "/signup"] as const;

export const AUTH_PROTECTED_PATHS = ["/profile", "/saved", "/for-you"] as const;

export const AUTH_ADMIN_PREFIX = "/admin";

export function isAuthGuestPath(pathname: string) {
  return AUTH_GUEST_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function isAuthProtectedPath(pathname: string) {
  return AUTH_PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function isAdminPath(pathname: string) {
  return pathname === AUTH_ADMIN_PREFIX || pathname.startsWith(`${AUTH_ADMIN_PREFIX}/`);
}

export function sanitizeRedirectPath(next: string | null | undefined, fallback = "/profile") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  if (isAuthGuestPath(next)) {
    return fallback;
  }

  return next;
}
