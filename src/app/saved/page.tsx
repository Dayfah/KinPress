import { redirect } from "next/navigation";
import ArticleCard from "@/components/article-card";
import { getSavedArticlesForUser } from "@/lib/articles";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SavedArticlesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const articles = await getSavedArticlesForUser(user.id);

  return (
    <main className="site-shell">
      <section className="saved-page-header">
        <p className="eyebrow">Saved articles</p>
        <h1>Your reading list</h1>
        <p>Stories you saved are collected here for easy reading later.</p>
      </section>

      {articles.length > 0 ? (
        <div className="article-list">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <section className="empty-saved-card">
          <h2>No saved articles yet.</h2>
          <p>Save a story from an article page and it will appear here.</p>
        </section>
      )}
    </main>
  );
}
