import type { Metadata } from "next";
import { getPublishedArticleBySlug, type Article } from "@/lib/articles";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article not found | KinPress",
    };
  }

  return {
    title: `${article.title} | KinPress`,
    description: article.subtitle ?? undefined,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    return <ArticleNotFound />;
  }

  return (
    <main className="article-page">
      <article className="article-shell">
        {article.coverImageUrl ? (
          <figure className="article-cover">
            <img src={article.coverImageUrl} alt="" />
          </figure>
        ) : null}

        <div className="article-card">
          <header>
            <div className="article-meta">
              {article.categoryName ? <span>{article.categoryName}</span> : null}
              {article.isPremium ? (
                <span className="premium-badge">Premium</span>
              ) : null}
            </div>

            <h1 className="article-title">{article.title}</h1>

            {article.subtitle ? (
              <p className="article-subtitle">{article.subtitle}</p>
            ) : null}

            <div className="article-byline">
              {article.authorName ? (
                <span>
                  By <strong>{article.authorName}</strong>
                </span>
              ) : null}
              {article.publishedAt ? (
                <time dateTime={article.publishedAt}>
                  {formatPublishedDate(article.publishedAt)}
                </time>
              ) : null}
            </div>
          </header>

          <ArticleBody article={article} />

          {article.tags.length > 0 ? (
            <ul className="tag-list" aria-label="Article tags">
              {article.tags.map((tag) => (
                <li key={tag}>#{tag}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </article>
    </main>
  );
}

function ArticleBody({ article }: { article: Article }) {
  const paragraphs = article.body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="article-body">
      {paragraphs.length > 0 ? (
        paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
      ) : (
        <p>Article body is not available.</p>
      )}
    </div>
  );
}

function ArticleNotFound() {
  return (
    <main className="site-shell">
      <section className="not-found-card">
        <p className="eyebrow">Article unavailable</p>
        <h1>We could not find that story.</h1>
        <p>
          The article may have moved, or it is not published yet. Please check
          the link and try again.
        </p>
      </section>
    </main>
  );
}

function formatPublishedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
