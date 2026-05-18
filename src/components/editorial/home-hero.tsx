import Link from "next/link";

import { ContentEmptyState } from "@/components/editorial/content-empty-state";
import { EditorialArticleCard } from "@/components/editorial/editorial-article-card";
import { SafeStoryImage } from "@/components/home/safe-story-image";
import { KINPRESS_DESCRIPTION, KINPRESS_TAGLINE } from "@/lib/brand";
import { formatPublishedDate } from "@/lib/content";
import type { HomepageHero } from "@/lib/editorial/types";

type HomeHeroProps = {
  hero: HomepageHero;
};

export function HomeHero({ hero }: HomeHeroProps) {
  const { lead, secondary } = hero;

  if (!lead) {
    return (
      <ContentEmptyState
        description={`${KINPRESS_DESCRIPTION} Stories appear here once published in Supabase.`}
        primaryHref="/latest"
        primaryLabel="Browse latest"
        secondaryHref="/signup"
        secondaryLabel="Join KinPress"
        title={KINPRESS_TAGLINE}
      />
    );
  }

  const date = formatPublishedDate(lead.publishedAt);

  return (
    <section aria-labelledby="home-hero-heading" className="min-w-0 space-y-4">
      <h2 className="sr-only" id="home-hero-heading">
        Top stories
      </h2>

      <article className="kp-home-card overflow-hidden">
        <Link className="block min-w-0" href={`/articles/${lead.slug}`}>
          {lead.imageUrl ? (
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-charcoal/10 sm:aspect-[21/9]">
              <SafeStoryImage
                className="h-full w-full object-cover"
                src={lead.imageUrl}
                wrapperClassName="h-full w-full"
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-muted-brown">
                <span className="rounded-full bg-heritage/12 px-2.5 py-1 text-heritage">
                  {lead.featured ? "Featured" : lead.category}
                </span>
                <span>{lead.readingTime} min read</span>
                {date ? <time dateTime={lead.publishedAt ?? undefined}>{date}</time> : null}
              </div>
              <h2 className="mt-4 font-serif text-[clamp(1.75rem,5vw,3rem)] font-bold leading-[1.05] tracking-tight text-ink">
                {lead.title}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/72 sm:text-base">
                {lead.excerpt}
              </p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-muted-brown">
                {lead.author}
                {lead.sourceName ? ` · Source: ${lead.sourceName}` : ""}
              </p>
            </div>
            <span className="kp-btn-primary shrink-0 self-start lg:self-end">
              {lead.isExternal ? "Read story" : "Read"}
            </span>
          </div>
        </Link>
      </article>

      {secondary.length > 0 ? (
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          {secondary.map((article) => (
            <EditorialArticleCard article={article} key={article.id} variant="hero-secondary" />
          ))}
        </div>
      ) : null}
    </section>
  );
}
