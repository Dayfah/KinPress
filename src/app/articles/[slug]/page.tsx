import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

import {
  CommentSection,
  type VisibleComment,
} from "@/components/comment-section";

type Article = {
  id: string;
  slug: string;
  title: string;
};

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

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server components cannot set cookies; middleware can refresh them.
          }
        },
      },
    },
  );
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

  const supabase = await createSupabaseServerClient();
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
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select("id, slug, title")
    .eq("slug", slug)
    .maybeSingle<Article>();

  if (articleError) {
    throw new Error(`Unable to load article: ${articleError.message}`);
  }

  if (!article) {
    notFound();
  }

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
    <main className="kp-section-tight">
      <article className="kp-page-container max-w-3xl space-y-8">
        <header className="space-y-4">
          <p className="kp-eyebrow">Article</p>
          <h1 className="font-serif text-5xl font-semibold leading-none tracking-editorial text-foreground sm:text-6xl">
            {article.title}
          </h1>
        </header>

        <CommentSection
          comments={comments ?? []}
          isLoggedIn={Boolean(user)}
          addCommentAction={addComment.bind(null, article.id, slug)}
        />
      </article>
    </main>
  );
}

