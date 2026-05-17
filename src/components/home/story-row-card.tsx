/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import type { HomeFeedArticle } from "@/lib/news/feed";
import { formatPublishedDate } from "@/lib/content";

type StoryRowCardProps = {
  article: HomeFeedArticle;
};

export function StoryRowCard({ article }: StoryRowCardProps) {
  const date = formatPublishedDate(article.publishedAt);
  const isExternal = article.isExternal;

  return (
    <article className="kp-home-card min-w-0 overflow-hidden">
      <Link
        className="flex min-w-0 gap-3 p-3 sm:gap-4 sm:p-4"
        href={article.href}
        rel={isExternal ? "noopener noreferrer" : undefined}
        target={isExternal ? "_blank" : undefined}
      >
        {article.imageUrl ? (
          <div className="size-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-charcoal/10 sm:size-24">
            <img
              alt=""
              className="h-full w-full object-cover"
              src={article.imageUrl}
            />
          </div>
        ) : (
          <div
            aria-hidden
            className="size-[4.5rem] shrink-0 rounded-xl bg-charcoal/15 sm:size-24"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-muted-brown sm:text-[11px]">
            <span className="truncate text-heritage">{article.category}</span>
            <span className="text-ink/40">·</span>
            <span className="truncate">{article.source}</span>
            {date ? (
              <>
                <span className="text-ink/40">·</span>
                <time className="shrink-0" dateTime={article.publishedAt}>
                  {date}
                </time>
              </>
            ) : null}
          </div>
          <h3 className="line-clamp-3 font-serif text-base font-bold leading-snug text-ink sm:text-lg">
            {article.title}
          </h3>
          {article.excerpt ? (
            <p className="line-clamp-2 text-xs leading-5 text-ink/65 sm:text-sm sm:leading-6">
              {article.excerpt}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
