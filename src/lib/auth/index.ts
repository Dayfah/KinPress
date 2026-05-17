export {
  AUTH_UNAVAILABLE_MESSAGE,
  AUTH_DEV_SETUP_HINT,
  mapAuthPageError,
  mapSupabaseAuthError,
} from "@/lib/auth/messages";
export {
  requireAdmin,
  requireAuthenticatedUser,
  requireEditorOrAdmin,
} from "@/lib/auth/guards";
export { ensureUserProfile } from "@/lib/auth/profile";
export {
  AUTH_ADMIN_PREFIX,
  AUTH_GUEST_PATHS,
  AUTH_PROTECTED_PATHS,
  isAdminPath,
  isAuthGuestPath,
  isAuthProtectedPath,
  sanitizeRedirectPath,
} from "@/lib/auth/routes";
export {
  getProfileForUser,
  getServerAuthSession,
  type AuthProfile,
  type ServerAuthSession,
} from "@/lib/auth/session";

/** Alias for server-side current user + profile. */
export { getServerAuthSession as getCurrentUser } from "@/lib/auth/session";
