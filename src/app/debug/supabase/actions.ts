"use server";

import { revalidatePath } from "next/cache";

import { isSupabaseDebugEnabled } from "@/lib/supabase/debug";
import { formatSupabaseError } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SaveDebugResult = {
  ok: boolean;
  message: string;
};

/** Inserts then deletes a saved_articles row for the logged-in user (debug only). */
export async function runSavedArticleDebugTest(
  articleId: string,
): Promise<SaveDebugResult> {
  if (!isSupabaseDebugEnabled()) {
    return { ok: false, message: "Debug routes are disabled." };
  }

  if (!articleId?.trim()) {
    return { ok: false, message: "Article id is required." };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { ok: false, message: "Supabase client not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Log in first to test saved_articles." };
  }

  const { error: insertError } = await supabase.from("saved_articles").insert({
    user_id: user.id,
    article_id: articleId.trim(),
  });

  if (insertError) {
    return {
      ok: false,
      message: `Insert failed: ${formatSupabaseError(insertError.message, insertError.code)}`,
    };
  }

  const { error: deleteError } = await supabase
    .from("saved_articles")
    .delete()
    .eq("user_id", user.id)
    .eq("article_id", articleId.trim());

  revalidatePath("/debug/supabase");
  revalidatePath("/saved");

  if (deleteError) {
    return {
      ok: false,
      message: `Insert OK but delete failed: ${formatSupabaseError(deleteError.message, deleteError.code)}`,
    };
  }

  return {
    ok: true,
    message: `saved_articles insert + delete succeeded for user ${user.id.slice(0, 8)}…`,
  };
}
