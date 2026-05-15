import Image from "next/image";
import Link from "next/link";
import type { ArticleSummary } from "@/lib/articles";

type ArticleCardProps = {
  article: ArticleSummary;
};

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="article-list-card">
      {article.coverImageUrl ? (
        <Link className="article-list-image" href={`/articles/${article.slug}`}>
          <Image
            src={article.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 760px) 100vw, 320px"
          />
        </Link>
      ) : null}

      <div className="article-list-content">
        <div className="article-list-meta">
          {article.categoryName ? <span>{article.categoryName}</span> : null}
          {article.isPremium ? <span>Premium</span> : null}
        </div>

        <h2>
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h2>

        {article.subtitle ? <p>{article.subtitle}</p> : null}

        <div className="article-list-footer">
          {article.authorName ? <span>By {article.authorName}</span> : null}
          {article.publishedAt ? (
            <time dateTime={article.publishedAt}>
              {formatPublishedDate(article.publishedAt)}
            </time>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function formatPublishedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
