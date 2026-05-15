export type FeaturedArticleProps = {
  title: string;
  slug: string;
  subtitle: string;
  coverImageUrl: string;
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

export function FeaturedArticle({
  title,
  slug,
  subtitle,
  coverImageUrl,
  categoryName,
  authorName,
  publishedAt,
  isPremium,
}: FeaturedArticleProps) {
  const href = getArticleHref(slug);
  const publishedDate = getPublishedDate(publishedAt);

  return (
    <article className="group relative overflow-hidden rounded-[2rem] bg-neutral-950 text-white shadow-2xl shadow-neutral-950/20">
      <a
        href={href}
        className="relative block min-h-[31rem] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 sm:min-h-[34rem] lg:min-h-[38rem]"
        aria-label={`Read ${title}`}
      >
        <img
          src={coverImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.35),transparent_34rem)]" />

        <div className="relative flex min-h-[31rem] flex-col justify-end gap-6 p-6 sm:min-h-[34rem] sm:p-8 lg:min-h-[38rem] lg:p-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-neutral-950">
              {categoryName}
            </span>
            {isPremium ? (
              <span className="rounded-full border border-amber-300/70 bg-amber-300/15 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-amber-100">
                KINPRESS+
              </span>
            ) : null}
          </div>

          <div className="max-w-4xl space-y-4">
            <h2 className="max-w-3xl text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl lg:text-7xl">
              {title}
            </h2>
            <p className="max-w-2xl text-base font-medium leading-7 text-neutral-100 sm:text-lg lg:text-xl">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-neutral-200 sm:text-base">
            <span>{authorName}</span>
            <span aria-hidden="true">/</span>
            <time dateTime={publishedDate.dateTime}>{publishedDate.label}</time>
          </div>
        </div>
      </a>
    </article>
  );
}

export default FeaturedArticle;
