import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type SaveArticleButtonProps = {
  articleId: string;
  articlePath: string;
};

async function toggleSavedArticle(formData: FormData) {
  "use server";

  const articleId = formData.get("articleId")?.toString();
  const articlePath = formData.get("articlePath")?.toString() ?? "/";

  if (!articleId) {
    throw new Error("Article id is required.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: savedArticle, error: savedArticleError } = await supabase
    .from("saved_articles")
    .select("article_id")
    .eq("user_id", user.id)
    .eq("article_id", articleId)
    .maybeSingle();

  if (savedArticleError && savedArticleError.code !== "PGRST116") {
    throw new Error(`Unable to check saved article: ${savedArticleError.message}`);
  }

  if (savedArticle) {
    const { error } = await supabase
      .from("saved_articles")
      .delete()
      .eq("user_id", user.id)
      .eq("article_id", articleId);

    if (error) {
      throw new Error(`Unable to unsave article: ${error.message}`);
    }
  } else {
    const { error } = await supabase.from("saved_articles").insert({
      user_id: user.id,
      article_id: articleId,
    });

    if (error) {
      throw new Error(`Unable to save article: ${error.message}`);
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isSaved = false;

  if (user) {
    const { data, error } = await supabase
      .from("saved_articles")
      .select("article_id")
      .eq("user_id", user.id)
      .eq("article_id", articleId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Unable to check saved article: ${error.message}`);
    }

    isSaved = Boolean(data);
  }

  return (
    <form action={toggleSavedArticle}>
      <input type="hidden" name="articleId" value={articleId} />
      <input type="hidden" name="articlePath" value={articlePath} />
      <button
        className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-bone transition hover:bg-heritage"
        type="submit"
      >
        {isSaved ? "Saved" : "Save"}
      </button>
    </form>
  );
}
