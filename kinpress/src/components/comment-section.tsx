import { CommentCard } from "@/components/comment-card";

const comments = [
  {
    author: "Nia R.",
    createdAt: "2 hours ago",
    body: "This is the kind of reporting I want to share with my family group chat."
  },
  {
    author: "Malik T.",
    createdAt: "Yesterday",
    body: "The community lens makes the story feel useful, not extractive."
  }
];

type CommentSectionProps = {
  articleSlug: string;
};

export function CommentSection({ articleSlug }: CommentSectionProps) {
  return (
    <section aria-labelledby="comments-heading" data-article-slug={articleSlug} className="mt-14">
      <h2 id="comments-heading" className="text-2xl font-black text-neutral-950">
        Community notes
      </h2>
      <div className="mt-5 grid gap-4">
        {comments.map((comment) => (
          <CommentCard key={`${comment.author}-${comment.createdAt}`} {...comment} />
        ))}
      </div>
    </section>
  );
}
