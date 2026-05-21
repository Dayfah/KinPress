import { ContentEmptyState } from "@/components/editorial/content-empty-state";
import { EditorialArticleCard } from "@/components/editorial/editorial-article-card";
import { ThemeAwareLogo } from "@/components/kinpress-logo";
import { getLatestArticles } from "@/lib/editorial/articles";

export default async function LatestPage() {
  const articles = await getLatestArticles(36);

  return (
    <main className="kp-home min-h-screen min-w-0 overflow-x-hidden">
      <section className="kp-shell max-w-6xl space-y-8 py-10">
        <header className="min-w-0 border-b border-ink/15 pb-6">
          <ThemeAwareLogo className="mb-5" showWordmark={false} size="sm" />
          <p className="kp-eyebrow">Latest</p>
          <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Latest news
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70">
            The most recent published stories from KinPress editorial and curated sources.
          </p>
        </header>

        {articles.length > 0 ? (
          <ul className="grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <li className="min-w-0" key={article.id}>
                <EditorialArticleCard article={article} />
              </li>
            ))}
          </ul>
        ) : (
          <ContentEmptyState
            description="Publish stories from the admin dashboard or run the editorial seed SQL in Supabase."
            primaryHref="/search"
            primaryLabel="Search"
            secondaryHref="/"
            secondaryLabel="Home"
            title="No published stories yet"
          />
        )}
      </section>
    </main>
  );
}
