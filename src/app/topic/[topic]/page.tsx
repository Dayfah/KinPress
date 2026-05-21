import { notFound } from "next/navigation";

import { ContentEmptyState } from "@/components/editorial/content-empty-state";
import { EditorialArticleCard } from "@/components/editorial/editorial-article-card";
import { ThemeAwareLogo } from "@/components/kinpress-logo";
import { getArticlesByTopic } from "@/lib/editorial/articles";
import { ARTICLE_TOPICS, type ArticleTopic } from "@/lib/editorial/types";
import { KINPRESS_DESCRIPTION } from "@/lib/brand";
import { TOPIC_LABELS } from "@/lib/masthead-nav";

export const dynamic = "force-dynamic";

type TopicPageProps = {
  params: Promise<{ topic: string }>;
};

function parseTopic(value: string): ArticleTopic | null {
  if (ARTICLE_TOPICS.includes(value as ArticleTopic)) {
    return value as ArticleTopic;
  }
  return null;
}

export async function generateMetadata({ params }: TopicPageProps) {
  const { topic: raw } = await params;
  const topic = parseTopic(raw);
  const label = topic ? TOPIC_LABELS[topic] : "Section";

  return {
    title: `${label} | KinPress`,
    description: `${label} coverage on KinPress — ${KINPRESS_DESCRIPTION}`,
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { topic: raw } = await params;
  const topic = parseTopic(raw);

  if (!topic) {
    notFound();
  }

  const articles = await getArticlesByTopic(topic);
  const label = TOPIC_LABELS[topic];

  return (
    <main className="kp-home min-h-screen min-w-0 overflow-x-hidden">
      <section className="kp-shell max-w-6xl space-y-8 py-10">
        <header className="min-w-0 border-b border-ink/15 pb-6">
          <ThemeAwareLogo className="mb-5" showWordmark={false} size="sm" />
          <p className="kp-eyebrow">Section</p>
          <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {label}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70">
            Published KinPress reporting and curated briefs on {label.toLowerCase()}.
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
            description={`No published ${label.toLowerCase()} stories yet. Check Latest or Search for other coverage.`}
            primaryHref="/latest"
            primaryLabel="Latest stories"
            secondaryHref="/search"
            secondaryLabel="Search"
            title={`${label} — coming soon`}
          />
        )}
      </section>
    </main>
  );
}
