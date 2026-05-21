import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { ArticleActionBar } from "@/components/article-action-bar";
import { EditorialArticleCard } from "@/components/editorial/editorial-article-card";
import { ThemeAwareLogo } from "@/components/kinpress-logo";
import SaveArticleButton from "@/components/save-article-button";
import {
  CommentSection,
  type VisibleComment,
} from "@/components/comment-section";
import { getArticleBySlug, getRelatedArticles } from "@/lib/editorial/articles";
import { formatPublishedDate } from "@/lib/content";
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
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article not found | KinPress",
    };
  }

  return {
    title: `${article.title} | KinPress`,
    description: article.excerpt,
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

  if (!supabase) {
    redirect("/login");
  }

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
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = await getRelatedArticles(article);
  const supabase = await createClient();
  let user = null;
  let comments: VisibleComment[] = [];

  if (supabase) {
    const userResult = await supabase.auth.getUser();
    user = userResult.data.user;

    const { data, error: commentsError } = await supabase
      .from("comments")
      .select("id, user_name, user_avatar_url, comment_text, created_at")
      .eq("article_id", article.id)
      .eq("status", "visible")
      .order("created_at", { ascending: true })
      .returns<VisibleComment[]>();

    if (commentsError) {
      console.error("[KinPress] load comments", commentsError.message);
    } else {
      comments = data ?? [];
    }
  }

  const publishedLabel = formatPublishedDate(article.publishedAt);

  return (
    <main className="min-h-screen">
      <article className="kp-shell mx-auto flex w-full max-w-5xl flex-col gap-10 py-8 sm:py-10">
        {article.imageUrl ? (
          <figure className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-ink/10">
            <Image
              alt=""
              className="object-cover"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              src={article.imageUrl}
            />
          </figure>
        ) : null}

        <header className="space-y-6 border-b border-ink/15 pb-10">
          <ThemeAwareLogo
            className="opacity-85"
            showWordmark={false}
            size="sm"
          />
          <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-brown">
            <span className="text-heritage">{article.category}</span>
            <span className="text-ink/40" aria-hidden>
              ·
            </span>
            <span>{article.readingTime} min read</span>
            {publishedLabel ? (
              <>
                <span className="text-ink/40" aria-hidden>
                  ·
                </span>
                <time dateTime={article.publishedAt ?? undefined}>{publishedLabel}</time>
              </>
            ) : null}
            {article.isPremium ? (
              <>
                <span className="text-ink/40" aria-hidden>
                  ·
                </span>
                <span>KinPress+</span>
              </>
            ) : null}
          </div>

          <h1 className="max-w-4xl font-serif text-4xl leading-[0.95] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {article.title}
          </h1>

          <p className="max-w-3xl text-lg leading-8 text-ink/75 sm:text-xl">{article.excerpt}</p>

          <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted-brown">
            By {article.author}
          </p>

          {article.kind === "curated_external" && article.sourceName && article.sourceUrl ? (
            <aside className="rounded-xl border border-ink/15 bg-bone/60 px-5 py-4 text-sm leading-6 text-ink/80 dark:border-ink/25 dark:bg-card/90 dark:text-ink/85">
              <p className="font-bold uppercase tracking-[0.12em] text-muted-brown">
                Curated from an external source
              </p>
              <p className="mt-2">
                KinPress summary · Full reporting at{" "}
                <a
                  className="font-bold text-heritage underline-offset-4 hover:underline"
                  href={article.sourceUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {article.sourceName}
                </a>
              </p>
            </aside>
          ) : null}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <ArticleActionBar
              commentCount={comments.length}
              excerpt={article.excerpt}
              path={`/articles/${article.slug}`}
              title={article.title}
            />
            <SaveArticleButton
              articleId={article.id}
              articlePath={`/articles/${article.slug}`}
            />
          </div>
        </header>

        <ArticleBody body={article.body} />

        {article.tags.length > 0 ? (
          <ul
            aria-label="Article tags"
            className="flex flex-wrap gap-2 border-t border-ink/15 pt-8"
          >
            {article.tags.map((tag) => (
              <li key={tag}>
                <Link
                  className="rounded-full border border-ink/15 px-3 py-1 text-sm font-bold text-muted-brown transition hover:border-heritage hover:text-heritage"
                  href={`/search?q=${encodeURIComponent(tag)}`}
                >
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {related.length > 0 ? (
          <section className="border-t border-ink/15 pt-10">
            <h2 className="font-serif text-2xl font-semibold text-ink">Related stories</h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.id}>
                  <EditorialArticleCard article={item} variant="compact" />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <CommentSection
          addCommentAction={addComment.bind(null, article.id, slug)}
          comments={comments}
          isLoggedIn={Boolean(user)}
        />
      </article>
    </main>
  );
}

function ArticleBody({ body }: { body: string }) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="max-w-3xl font-serif text-xl leading-9 text-ink sm:text-2xl sm:leading-10">
      {paragraphs.length > 0 ? (
        paragraphs.map((paragraph, index) => (
          <p className="mb-7" key={index}>
            {paragraph}
          </p>
        ))
      ) : (
        <p className="text-base font-sans text-ink/70">Full article text is not available.</p>
      )}
    </div>
  );
}
