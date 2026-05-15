import { redirect } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
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
    <main className="kp-section-tight">
      <section className="kp-page-container max-w-5xl space-y-5">
        <p className="kp-eyebrow">Saved articles</p>
        <h1 className="font-serif text-5xl font-semibold leading-none tracking-editorial text-foreground sm:text-6xl">
          Your reading list
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-ink/70">
          Stories you saved are collected here for easy reading later.
        </p>
      </section>

      {articles.length > 0 ? (
        <div className="kp-page-container mt-12 grid max-w-5xl gap-x-7 gap-y-10 sm:grid-cols-2">
          {articles.map((article) => (
            <ArticleCard
              authorName={article.authorName ?? ""}
              categoryName={article.categoryName ?? ""}
              coverImageUrl={article.coverImageUrl}
              id={article.id}
              isPremium={article.isPremium}
              key={article.id}
              publishedAt={article.publishedAt ?? ""}
              slug={article.slug}
              subtitle={article.subtitle ?? ""}
              title={article.title}
            />
          ))}
        </div>
      ) : (
        <section className="kp-page-container mt-12 max-w-5xl border border-dashed border-ink/30 bg-bone/75 p-10 text-center">
          <h2 className="font-serif text-3xl text-ink">No saved articles yet.</h2>
          <p className="mt-3 text-sm leading-6 text-ink/65">
            Save a story from an article page and it will appear here.
          </p>
        </section>
      )}
    </main>
  );
}
