import Link from "next/link";

import { SafeStoryImage } from "@/components/home/safe-story-image";
import { formatPublishedDate } from "@/lib/content";
import type { HomeFeedArticle } from "@/lib/news/feed";

type FeaturedStoryCardProps = {
  article: HomeFeedArticle;
};

export function FeaturedStoryCard({ article }: FeaturedStoryCardProps) {
  const date = formatPublishedDate(article.publishedAt);
  const isExternal = article.isExternal;

  return (
    <article className="kp-home-card overflow-hidden">
      <Link
        className="block min-w-0"
        href={article.href}
        rel={isExternal ? "noopener noreferrer" : undefined}
        target={isExternal ? "_blank" : undefined}
      >
        {article.imageUrl ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal/10">
            <SafeStoryImage
              className="h-full w-full object-cover"
              src={article.imageUrl}
              wrapperClassName="aspect-[16/10] w-full"
            />
          </div>
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-charcoal px-6 text-center">
            <span className="font-serif text-2xl leading-tight text-bone">
              Black stories, reported with care.
            </span>
          </div>
        )}
      </Link>

      <div className="grid min-w-0 gap-4 p-4 sm:p-5">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-brown">
          <span className="rounded-full bg-heritage/12 px-2.5 py-1 text-heritage">
            {article.isKinPressOriginal ? "KinPress Original" : article.category}
          </span>
          <span className="text-ink/50">·</span>
          <span>{article.source}</span>
          {date ? (
            <>
              <span className="text-ink/50">·</span>
              <time dateTime={article.publishedAt}>{date}</time>
            </>
          ) : null}
        </div>

        <Link
          className="min-w-0"
          href={article.href}
          rel={isExternal ? "noopener noreferrer" : undefined}
          target={isExternal ? "_blank" : undefined}
        >
          <h2 className="font-serif text-[clamp(1.35rem,4.5vw,2rem)] font-bold leading-[1.08] tracking-tight text-ink transition hover:text-heritage">
            {article.title}
          </h2>
          {article.excerpt ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/72 sm:text-[15px] sm:leading-7">
              {article.excerpt}
            </p>
          ) : null}
        </Link>

        <div className="flex min-w-0 items-center justify-start pt-1">
          <Link
            className="kp-btn-primary text-sm"
            href={article.href}
            rel={isExternal ? "noopener noreferrer" : undefined}
            target={isExternal ? "_blank" : undefined}
          >
            {isExternal ? "Read story" : "Read"}
          </Link>
        </div>
      </div>
    </article>
  );
}
