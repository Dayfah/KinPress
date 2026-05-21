import Link from "next/link";

import { SafeStoryImage } from "@/components/home/safe-story-image";
import { formatPublishedDate } from "@/lib/content";
import type { EditorialArticle } from "@/lib/editorial/types";
import { cn } from "@/lib/utils";

type EditorialArticleCardProps = {
  article: EditorialArticle;
  variant?: "rail" | "compact" | "hero-secondary";
  className?: string;
};

export function EditorialArticleCard({
  article,
  variant = "rail",
  className,
}: EditorialArticleCardProps) {
  const date = formatPublishedDate(article.publishedAt);
  const isCompact = variant === "compact";
  const isHeroSecondary = variant === "hero-secondary";

  return (
    <article
      className={cn(
        "kp-home-card group min-w-0 overflow-hidden transition hover:-translate-y-0.5",
        className,
      )}
    >
      <Link
        className={cn(
          "block min-w-0",
          isCompact && "flex gap-3 p-3 sm:gap-4 sm:p-4",
          !isCompact && !isHeroSecondary && "p-0",
          isHeroSecondary && "p-0",
        )}
        href={article.href}
      >
        {article.imageUrl ? (
          <div
            className={cn(
              "overflow-hidden bg-charcoal/10",
              isCompact && "size-[4.5rem] shrink-0 rounded-xl sm:size-24",
              isHeroSecondary && "aspect-[16/10] w-full",
              !isCompact && !isHeroSecondary && "aspect-[4/3] w-full",
            )}
          >
            <SafeStoryImage
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              src={article.imageUrl}
              wrapperClassName="h-full w-full"
            />
          </div>
        ) : null}

        <div>
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-brown sm:text-[11px]">
            <span className="text-heritage">{article.category}</span>
            <span className="text-ink/40">·</span>
            <span>{article.readingTime} min read</span>
            {date ? (
              <>
                <span className="text-ink/40">·</span>
                <time dateTime={article.publishedAt ?? undefined}>{date}</time>
              </>
            ) : null}
          </div>

          <h3
            className={cn(
              "mt-2 font-serif font-bold leading-snug text-ink transition group-hover:text-heritage",
              isCompact && "line-clamp-3 text-base sm:text-lg",
              isHeroSecondary && "text-xl sm:text-2xl",
              !isCompact && !isHeroSecondary && "line-clamp-3 text-lg sm:text-xl",
            )}
          >
            {article.title}
          </h3>

          {!isCompact ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/70">{article.excerpt}</p>
          ) : (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/65 sm:text-sm">
              {article.excerpt}
            </p>
          )}

          <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-brown">
            {article.author}
            {article.sourceName ? ` · via ${article.sourceName}` : ""}
          </p>
        </div>
      </Link>
    </article>
  );
}
