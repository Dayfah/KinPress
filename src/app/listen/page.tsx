import { EditorialArticleCard } from "@/components/editorial/editorial-article-card";
import { ContentEmptyState } from "@/components/editorial/content-empty-state";
import { ThemeAwareLogo } from "@/components/kinpress-logo";
import { getLatestArticles } from "@/lib/editorial/articles";

export default async function ListenPage() {
  const articles = await getLatestArticles(18);

  return (
    <main className="kp-home min-h-screen min-w-0 overflow-x-hidden">
      <section className="kp-shell max-w-6xl space-y-8 py-10">
        <header className="border-b border-ink/15 pb-8">
          <ThemeAwareLogo className="mb-5" showWordmark={false} size="sm" />
          <p className="kp-eyebrow">Listen</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Listen to KinPress stories.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/70 sm:text-base">
            Open a story and tap Listen for an on-device audio readout. Native audio briefs can be layered into this surface when editorial production is ready.
          </p>
        </header>

        {articles.length > 0 ? (
          <ul className="grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <li key={article.id}>
                <EditorialArticleCard article={article} />
              </li>
            ))}
          </ul>
        ) : (
          <ContentEmptyState
            description="Published stories will appear here when Supabase has current editorial content."
            primaryHref="/latest"
            primaryLabel="Latest stories"
            secondaryHref="/resources"
            secondaryLabel="Resources"
            title="No stories ready to listen yet"
          />
        )}
      </section>
    </main>
  );
}
