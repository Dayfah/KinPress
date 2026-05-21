import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type SaveArticleButtonProps = {
  articleId: string;
  articlePath: string;
};

function redirectWithSaveError(articlePath: string, message: string) {
  redirect(`${articlePath}?save_error=${encodeURIComponent(message)}`);
}

async function toggleSavedArticle(formData: FormData) {
  "use server";

  const articleId = formData.get("articleId")?.toString();
  const articlePath = formData.get("articlePath")?.toString() ?? "/";

  if (!articleId) {
    redirectWithSaveError(articlePath, "Article id is missing.");
  }

  const supabase = await createClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(articlePath)}`);
  }

  const { data: savedArticle, error: savedArticleError } = await supabase
    .from("saved_articles")
    .select("article_id")
    .eq("user_id", user.id)
    .eq("article_id", articleId)
    .maybeSingle();

  if (savedArticleError && savedArticleError.code !== "PGRST116") {
    redirectWithSaveError(articlePath, `Unable to check saved article: ${savedArticleError.message}`);
  }

  if (savedArticle) {
    const { error } = await supabase
      .from("saved_articles")
      .delete()
      .eq("user_id", user.id)
      .eq("article_id", articleId);

    if (error) {
      redirectWithSaveError(articlePath, `Unable to unsave article: ${error.message}`);
    }
  } else {
    const { data: article, error: articleError } = await supabase
      .from("articles")
      .select("id")
      .eq("id", articleId)
      .eq("status", "published")
      .maybeSingle();

    if (articleError || !article) {
      redirectWithSaveError(articlePath, "This story is not available to save.");
    }

    const { error } = await supabase.from("saved_articles").insert({
      user_id: user.id,
      article_id: articleId,
    });

    if (error) {
      redirectWithSaveError(articlePath, `Unable to save article: ${error.message}`);
    }
  }

  revalidatePath(articlePath);
  revalidatePath("/saved");
}

export default async function SaveArticleButton({
  articleId,
  articlePath,
}: SaveArticleButtonProps) {
  const supabase = await createClient();
  let isSaved = false;
  let isLoggedIn = false;

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    isLoggedIn = Boolean(user);

    if (user) {
      const { data, error } = await supabase
        .from("saved_articles")
        .select("article_id")
        .eq("user_id", user.id)
        .eq("article_id", articleId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("[KinPress] save button check", error.message);
      } else {
        isSaved = Boolean(data);
      }
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Link
          className="kp-btn-primary text-sm"
          href={`/login?next=${encodeURIComponent(articlePath)}`}
        >
          Sign in to save
        </Link>
        <p className="text-sm text-ink/65">Save stories to your reading list.</p>
      </div>
    );
  }

  return (
    <form action={toggleSavedArticle}>
      <input type="hidden" name="articleId" value={articleId} />
      <input type="hidden" name="articlePath" value={articlePath} />
      <button className="kp-btn-primary text-sm" type="submit">
        {isSaved ? "Saved" : "Save article"}
      </button>
    </form>
  );
}
