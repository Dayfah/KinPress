import { CommentCard } from "@/components/comment-card";

export type VisibleComment = {
  id: string | number;
  user_name: string | null;
  user_avatar_url: string | null;
  comment_text: string;
  created_at: string;
};

type CommentSectionProps = {
  comments: VisibleComment[];
  isLoggedIn: boolean;
  addCommentAction: (formData: FormData) => Promise<void>;
};

export function CommentSection({
  comments,
  isLoggedIn,
  addCommentAction,
}: CommentSectionProps) {
  return (
    <section className="kp-section-tight border-t border-border">
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="kp-eyebrow">Discussion</p>
          <h2 className="font-serif text-3xl font-semibold tracking-editorial text-foreground sm:text-4xl">
            Comments
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Share a thoughtful response with the KinPress community.
          </p>
        </div>

        {isLoggedIn ? (
          <form action={addCommentAction} className="kp-form kp-form-grid">
            <div className="kp-field">
              <label className="kp-label" htmlFor="comment_text">
                Add a comment
              </label>
              <textarea
                className="kp-textarea"
                id="comment_text"
                name="comment_text"
                placeholder="Write a respectful comment..."
                required
              />
            </div>
            <div className="flex justify-end">
              <button className="kp-button" type="submit">
                Post comment
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-lg border border-border bg-card p-6 text-muted-foreground shadow-sm">
            <p>
              Please{" "}
              <a className="font-semibold text-primary" href="/login">
                log in
              </a>{" "}
              to join the conversation.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentCard
                key={comment.id}
                userName={comment.user_name}
                userAvatarUrl={comment.user_avatar_url}
                commentText={comment.comment_text}
                createdAt={comment.created_at}
              />
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-border bg-card/60 p-6 text-center text-muted-foreground">
              No comments yet. Be the first to respond.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

