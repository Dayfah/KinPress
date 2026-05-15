type CommentCardProps = {
  userName: string | null;
  userAvatarUrl: string | null;
  commentText: string;
  createdAt: string;
};

function getInitial(name: string | null) {
  return name?.trim().charAt(0).toUpperCase() || "K";
}

function formatCommentDate(createdAt: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(createdAt));
}

export function CommentCard({
  userName,
  userAvatarUrl,
  commentText,
  createdAt,
}: CommentCardProps) {
  const displayName = userName?.trim() || "KinPress reader";

  return (
    <article className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <header className="mb-4 flex items-center gap-3">
        {userAvatarUrl ? (
          <img
            src={userAvatarUrl}
            alt=""
            className="h-10 w-10 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted font-serif text-sm font-semibold text-muted-foreground">
            {getInitial(displayName)}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{displayName}</p>
          <time className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {formatCommentDate(createdAt)}
          </time>
        </div>
      </header>

      <p className="whitespace-pre-wrap text-sm leading-7 text-foreground sm:text-base">
        {commentText}
      </p>
    </article>
  );
}

