type CommentCardProps = {
  author: string;
  body: string;
  createdAt: string;
};

export function CommentCard({ author, body, createdAt }: CommentCardProps) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="font-bold text-neutral-950">{author}</p>
        <time className="text-sm text-neutral-500">{createdAt}</time>
      </div>
      <p className="mt-3 text-neutral-700">{body}</p>
    </article>
  );
}
