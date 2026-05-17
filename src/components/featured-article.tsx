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

type FeaturedArticleProps = {
  article: ArticleRecord;
};

export function FeaturedArticle({ article }: FeaturedArticleProps) {
  const title = firstText(article, ["title"], "Untitled story");
  const image = getArticleImage(article);
  const excerpt = getArticleExcerpt(article);
  const category = getArticleCategory(article);
  const date = formatPublishedDate(article.published_at);

  return (
    <article className="overflow-hidden border-y border-ink bg-bone">
      <Link className="grid min-w-0 gap-0 lg:grid-cols-[1.1fr_0.9fr]" href={getArticleHref(article)}>
        <div className="flex min-h-[18rem] flex-col justify-between gap-8 p-5 sm:min-h-[22rem] sm:gap-10 sm:p-8 lg:min-h-[24rem] lg:p-10">
          <div className="grid gap-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-heritage">
              Featured
            </p>

            <h2 className="max-w-3xl font-serif text-[clamp(1.75rem,4.5vw,3.75rem)] leading-[0.95] text-ink">
              {title}
            </h2>

            {excerpt ? (
              <p className="max-w-2xl text-base leading-7 text-ink/75 sm:text-lg">
                {excerpt}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-brown">
            {category ? <span>{category}</span> : null}
            {category && date ? <span aria-hidden="true">/</span> : null}
            {date ? <time dateTime={article.published_at ?? undefined}>{date}</time> : null}
          </div>
        </div>

        {image ? (
          <div className="min-h-[20rem] bg-ink/10 lg:min-h-full">
            <img alt="" className="h-full w-full object-cover" src={image} />
          </div>
        ) : (
          <div className="grid min-h-[20rem] place-items-center bg-deep-green p-8 text-center text-bone lg:min-h-full">
            <span className="max-w-xs font-serif text-3xl leading-tight">
              Black stories, archived with care.
            </span>
          </div>
        )}
      </Link>
    </article>
  );
}
