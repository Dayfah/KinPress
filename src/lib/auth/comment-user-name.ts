type CommentNameProfile = {
  display_name?: string | null;
  username?: string | null;
};

/**
 * Public comment attribution must never fall back to the account email.
 * Empty profile names resolve to a generic reader label instead.
 * Database trigger `force_comment_attribution_from_profile` enforces the same
 * rule for direct Data API inserts.
 */
export function resolveCommentUserName(
  profile: CommentNameProfile | null | undefined,
): string {
  return (
    profile?.display_name?.trim() ||
    profile?.username?.trim() ||
    "KinPress reader"
  );
}
