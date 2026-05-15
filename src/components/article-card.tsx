/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ArticleRecord } from "@/lib/content";
import {
  firstText,
  formatPublishedDate,
  getArticleCategory,
  getArticleExcerpt,
  getArticleHref,
  getArticleImage,
} from "@/lib/content";

type ArticleCardProps = {
  article: ArticleRecord;
};

export function ArticleCard({ article }: ArticleCardProps) {
  const title = firstText(article, ["title"], "Untitled story");
  const image = getArticleImage(article);
  const excerpt = getArticleExcerpt(article);
  const category = getArticleCategory(article);
  const date = formatPublishedDate(article.published_at);

  return (
    <article className="group border-t border-ink/15 pt-5">
      <Link className="grid gap-4" href={getArticleHref(article)}>
        {image ? (
          <div className="aspect-[4/3] overflow-hidden bg-ink/10">
            <img
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              src={image}
            />
          </div>
        ) : null}

        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-brown">
            {category ? <span>{category}</span> : null}
            {category && date ? <span aria-hidden="true">/</span> : null}
            {date ? <time dateTime={article.published_at ?? undefined}>{date}</time> : null}
          </div>

          <h3 className="font-serif text-2xl leading-tight text-ink transition group-hover:text-heritage">
            {title}
          </h3>

          {excerpt ? (
            <p className="line-clamp-3 text-sm leading-6 text-ink/70">{excerpt}</p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
