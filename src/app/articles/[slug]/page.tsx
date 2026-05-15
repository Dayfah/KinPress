import type { Metadata } from "next";
import Image from "next/image";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import SaveArticleButton from "@/components/save-article-button";
import {
  CommentSection,
  type VisibleComment,
} from "@/components/comment-section";
import { getPublishedArticleBySlug, type Article } from "@/lib/articles";
import { createClient } from "@/lib/supabase/server";

type CommentProfile = {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article not found | KinPress",
    };
  }

  return {
    title: `${article.title} | KinPress`,
    description: article.subtitle ?? undefined,
  };
}

function readCommentText(formData: FormData) {
  const value = formData.get("comment_text");

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getUserName(profile: CommentProfile | null, email?: string) {
  return (
    profile?.display_name?.trim() ||
    profile?.username?.trim() ||
    email ||
    "KinPress reader"
  );
}

async function addComment(articleId: string, slug: string, formData: FormData) {
  "use server";

  const commentText = readCommentText(formData);

  if (!commentText) {
    redirect(`/articles/${slug}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, avatar_url")
    .eq("id", user.id)
    .maybeSingle<CommentProfile>();

  const { error } = await supabase.from("comments").insert({
    article_id: articleId,
    user_id: user.id,
    user_name: getUserName(profile, user.email),
    user_avatar_url: profile?.avatar_url ?? null,
    comment_text: commentText,
    status: "visible",
  });

  if (error) {
    throw new Error(`Unable to add comment: ${error.message}`);
  }

  revalidatePath(`/articles/${slug}`);
  redirect(`/articles/${slug}`);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [article, supabase] = await Promise.all([
    getPublishedArticleBySlug(slug),
    createClient(),
  ]);

  if (!article) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select("id, user_name, user_avatar_url, comment_text, created_at")
    .eq("article_id", article.id)
    .eq("status", "visible")
    .order("created_at", { ascending: true })
    .returns<VisibleComment[]>();

  if (commentsError) {
    throw new Error(`Unable to load comments: ${commentsError.message}`);
  }

  return (
    <main className="min-h-screen">
      <article className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10">
        {article.coverImageUrl ? (
          <figure className="relative aspect-[16/9] overflow-hidden bg-ink/10">
            <Image
              alt=""
              className="object-cover"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              src={article.coverImageUrl}
            />
          </figure>
        ) : null}

        <header className="space-y-6 border-b border-ink/15 pb-10">
          <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.22em] text-muted-brown">
            {article.categoryName ? <span>{article.categoryName}</span> : null}
            {article.isPremium ? <span>KinPress+</span> : null}
          </div>

          <h1 className="max-w-4xl font-serif text-5xl leading-[0.92] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            {article.title}
          </h1>

          {article.subtitle ? (
            <p className="max-w-3xl font-serif text-2xl leading-snug text-ink/70">
              {article.subtitle}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-4 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown">
            {article.authorName ? <span>By {article.authorName}</span> : null}
            {article.publishedAt ? (
              <time dateTime={article.publishedAt}>
                {formatPublishedDate(article.publishedAt)}
              </time>
            ) : null}
          </div>

          <SaveArticleButton
            articleId={article.id}
            articlePath={`/articles/${article.slug}`}
          />
        </header>

        <ArticleBody article={article} />

        {article.tags.length > 0 ? (
          <ul
            aria-label="Article tags"
            className="flex flex-wrap gap-2 border-t border-ink/15 pt-8"
          >
            {article.tags.map((tag) => (
              <li
                className="rounded-full border border-ink/15 px-3 py-1 text-sm font-bold text-muted-brown"
                key={tag}
              >
                #{tag}
              </li>
            ))}
          </ul>
        ) : null}

        <CommentSection
          addCommentAction={addComment.bind(null, article.id, slug)}
          comments={comments ?? []}
          isLoggedIn={Boolean(user)}
        />
      </article>
    </main>
  );
}

function ArticleBody({ article }: { article: Article }) {
  const paragraphs = article.body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="max-w-3xl font-serif text-xl leading-9 text-ink sm:text-2xl sm:leading-10">
      {paragraphs.length > 0 ? (
        paragraphs.map((paragraph, index) => <p className="mb-7" key={index}>{paragraph}</p>)
      ) : (
        <p>Article body is not available.</p>
      )}
    </div>
  );
}

function formatPublishedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
