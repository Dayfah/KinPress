import { redirect } from "next/navigation";

import { EditorialArticleCard } from "@/components/editorial/editorial-article-card";
import { ThemeAwareLogo } from "@/components/kinpress-logo";
import { SupabaseConfigNotice } from "@/components/supabase-config-notice";
import { getSavedEditorialArticles } from "@/lib/editorial/saved";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SavedArticlesPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <main className="min-h-screen min-w-0 overflow-x-hidden">
        <section className="kp-page-container max-w-lg py-12 sm:py-16">
          <SupabaseConfigNotice title="Saved articles unavailable" />
        </section>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/saved");
  }

  const articles = await getSavedEditorialArticles(user.id);

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden">
      <section className="kp-page-container max-w-5xl space-y-5 py-10">
        <ThemeAwareLogo className="mb-5" showWordmark={false} size="sm" />
        <p className="kp-eyebrow">Saved articles</p>
        <h1 className="kp-heading font-semibold tracking-editorial text-foreground">
          Your reading list
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-ink/70">
          Stories you saved are collected here. Open a story and tap Save again to remove it.
        </p>
      </section>

      {articles.length > 0 ? (
        <ul className="kp-page-container mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
          {articles.map((article) => (
            <li key={article.id}>
              <EditorialArticleCard article={article} variant="compact" />
            </li>
          ))}
        </ul>
      ) : (
        <section className="kp-page-container mt-12 max-w-5xl rounded-2xl border border-dashed border-ink/30 bg-bone/75 p-10 text-center">
          <h2 className="font-serif text-3xl text-ink">No saved articles yet</h2>
          <p className="mt-3 text-sm leading-6 text-ink/65">
            Save a story from an article page and it will appear here.
          </p>
        </section>
      )}
    </main>
  );
}
