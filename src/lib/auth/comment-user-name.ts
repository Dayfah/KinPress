type CommentNameProfile = {
  display_name?: string | null;
  username?: string | null;
};

/**
 * Public comment attribution must never fall back to the account email.
 * Empty profile names resolve to a generic reader label instead.
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
