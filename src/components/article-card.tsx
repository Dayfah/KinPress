export type ArticleCardProps = {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  coverImageUrl?: string | null;
  categoryName: string;
  authorName: string;
  publishedAt: string | Date;
  isPremium: boolean;
};

const publishedDateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function getArticleHref(slug: string) {
  return `/articles/${slug.replace(/^\/+/, "")}`;
}

function getPublishedDate(publishedAt: string | Date) {
  const date =
    publishedAt instanceof Date ? publishedAt : new Date(publishedAt);

  if (Number.isNaN(date.getTime())) {
    return {
      dateTime: String(publishedAt),
      label: String(publishedAt),
    };
  }

  return {
    dateTime: date.toISOString(),
    label: publishedDateFormatter.format(date),
  };
}

export function ArticleCard({
  id,
  title,
  slug,
  subtitle,
  coverImageUrl,
  categoryName,
  authorName,
  publishedAt,
  isPremium,
}: ArticleCardProps) {
  const href = getArticleHref(slug);
  const publishedDate = getPublishedDate(publishedAt);

  return (
    <article
      data-article-id={id}
      className="kp-article-card flex h-full flex-col bg-card"
    >
      <a
        href={href}
        className="flex h-full flex-col text-card-foreground no-underline focus:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        aria-label={`Read ${title}`}
      >
        {coverImageUrl ? (
          <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
            <img
              src={coverImageUrl}
              alt=""
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-kinpress-ink/55 via-transparent to-transparent" />
          </div>
        ) : null}

        <div className="kp-article-card-body flex flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="kp-category-pill">{categoryName}</span>
            {isPremium ? (
              <span className="kp-premium-badge">KINPRESS+</span>
            ) : null}
          </div>

          <div className="space-y-3">
            <h3 className="kp-article-card-title">{title}</h3>
            <p className="text-base leading-7 text-muted-foreground">
              {subtitle}
            </p>
          </div>

          <div className="kp-meta mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-2">
            <span>{authorName}</span>
            <span aria-hidden="true">/</span>
            <time dateTime={publishedDate.dateTime}>{publishedDate.label}</time>
          </div>
        </div>
      </a>
    </article>
  );
}

export default ArticleCard;
