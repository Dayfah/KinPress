import Link from "next/link";
import { Suspense } from "react";

import { ArticleCard } from "@/components/article-card";
import { CategoryPillRow } from "@/components/home/category-pill-row";
import { FeaturedStoryCard } from "@/components/home/featured-story-card";
import { HomeHero } from "@/components/home/home-hero";
import { StoryRowCard } from "@/components/home/story-row-card";
import { getKinPressHomeArticles } from "@/lib/kinpress-articles";
import { getMastheadSession } from "@/lib/masthead-session";
import { getCachedNewsArticles } from "@/lib/news/cache";
import { getNewsCategoryConfig, parseNewsCategorySlug } from "@/lib/news/categories";
import {
  kinpressArticleToHomeFeed,
  pickFeaturedAndRest,
  toHomeFeedArticle,
} from "@/lib/news/feed";

type HomePageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const category = parseNewsCategorySlug(params?.category);
  const categoryConfig = getNewsCategoryConfig(category);

  const [{ isLoggedIn }, newsResult, kinpress] = await Promise.all([
    getMastheadSession(),
    getCachedNewsArticles(category),
    getKinPressHomeArticles(6),
  ]);

  const wireArticles = newsResult.articles.map(toHomeFeedArticle);
  const { featured: wireFeatured, rest: wireRest } = pickFeaturedAndRest(wireArticles);
  const hasWire = Boolean(wireFeatured) || wireRest.length > 0;
  const usingMock = newsResult.source === "mock";

  const kinpressFeatured = kinpress.featured
    ? kinpressArticleToHomeFeed(kinpress.featured)
    : null;
  const kinpressRest = kinpress.recent.map(kinpressArticleToHomeFeed);
  const hasKinpress = Boolean(kinpressFeatured) || kinpressRest.length > 0;

  return (
    <main className="kp-home min-h-screen min-w-0 overflow-x-hidden">
      <div className="kp-shell mx-auto flex w-full max-w-6xl flex-col gap-8 py-5 sm:gap-10 sm:py-8 lg:py-10">
        <HomeHero isLoggedIn={isLoggedIn} />

        <Suspense
          fallback={
            <div
              className="kp-pill-scroll -mx-[var(--kp-shell-pad,1rem)] h-11 min-w-0 animate-pulse rounded-full bg-ink/10 px-[var(--kp-shell-pad,1rem)]"
              id="sections"
            />
          }
        >
          <CategoryPillRow />
        </Suspense>

        {hasKinpress ? (
          <section
            aria-labelledby="kinpress-originals-heading"
            className="min-w-0 space-y-5"
            id="kinpress-originals"
          >
            <div className="flex min-w-0 items-end justify-between gap-4">
              <div className="min-w-0">
                <h2
                  className="font-serif text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-tight text-ink"
                  id="kinpress-originals-heading"
                >
                  KinPress Originals
                </h2>
                <p className="mt-1 text-sm text-ink/65">
                  Stories reported and published by our newsroom.
                </p>
              </div>
              <Link
                className="kp-btn-ghost shrink-0 text-xs uppercase tracking-[0.12em]"
                href="/search?q=kinpress"
              >
                Browse all
              </Link>
            </div>

            {kinpressFeatured ? <FeaturedStoryCard article={kinpressFeatured} /> : null}

            {kinpressRest.length > 0 ? (
              <ul className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4">
                {kinpressRest.slice(0, 4).map((article) => (
                  <li className="min-w-0" key={article.id}>
                    <StoryRowCard article={article} />
                  </li>
                ))}
              </ul>
            ) : null}

            {kinpress.recent.length > 0 ? (
              <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
                {kinpress.recent.slice(0, 3).map((article, index) => (
                  <ArticleCard article={article} key={String(article.id ?? index)} />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <section aria-labelledby="top-stories-heading" className="min-w-0 space-y-5">
          <div className="flex min-w-0 items-end justify-between gap-4">
            <div className="min-w-0">
              <h2
                className="font-serif text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-tight text-ink"
                id="top-stories-heading"
              >
                {categoryConfig.label}
              </h2>
              {usingMock ? (
                <p className="mt-1 text-xs text-muted-brown">
                  Showing editorial previews — add GNEWS_API_KEY for live headlines.
                </p>
              ) : null}
            </div>
            <Link
              className="kp-btn-ghost shrink-0 text-xs uppercase tracking-[0.12em]"
              href={`/search?q=${encodeURIComponent(categoryConfig.label)}`}
            >
              See all
            </Link>
          </div>

          {wireFeatured ? <FeaturedStoryCard article={wireFeatured} /> : null}

          {wireRest.length > 0 ? (
            <ul className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2">
              {wireRest.map((article) => (
                <li className="min-w-0" key={article.id}>
                  <StoryRowCard article={article} />
                </li>
              ))}
            </ul>
          ) : null}

          {!hasWire && !hasKinpress ? (
            <div className="kp-home-card px-6 py-12 text-center">
              <p className="font-serif text-2xl text-ink sm:text-3xl">
                Headlines are loading.
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/70">
                Try another section or check back shortly.
              </p>
            </div>
          ) : null}
        </section>

        <section className="kp-home-card hidden min-w-0 p-6 sm:block lg:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-heritage">
            KinPress membership
          </p>
          <h2 className="mt-3 max-w-xl font-serif text-2xl leading-tight text-ink lg:text-3xl">
            A newsroom and archive built for the people who keep culture moving.
          </h2>
          <Link className="kp-btn-outline mt-5 inline-flex" href="/signup">
            Join the list
          </Link>
        </section>
      </div>
    </main>
  );
}
