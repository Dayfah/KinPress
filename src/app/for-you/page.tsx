import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { StoryRowCard } from "@/components/home/story-row-card";
import { SupabaseConfigNotice } from "@/components/supabase-config-notice";
import { requireAuthenticatedUser } from "@/lib/auth/guards";
import { getForYouFeed } from "@/lib/for-you-feed";
import { kinpressArticleToHomeFeed } from "@/lib/news/feed";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ForYouPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <main className="min-h-screen min-w-0 overflow-x-hidden">
        <section className="kp-shell max-w-5xl py-10">
          <SupabaseConfigNotice title="For You unavailable" />
        </section>
      </main>
    );
  }

  const { user } = await requireAuthenticatedUser();
  const feed = await getForYouFeed(user.id);

  const kinpressCards = feed.kinpress.map(kinpressArticleToHomeFeed);
  const hasContent =
    feed.saved.length > 0 || kinpressCards.length > 0 || feed.headlines.length > 0;

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden">
      <section className="kp-shell max-w-5xl space-y-4 py-10">
        <p className="kp-eyebrow">For You</p>
        <h1 className="kp-heading font-semibold tracking-editorial text-ink">
          Picked for your reading list
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-ink/70 sm:text-base">
          {feed.interestLabels.length > 0
            ? `Based on your saves and interests in ${feed.interestLabels.join(", ")}.`
            : "Stories from KinPress and headlines matched to popular sections."}
        </p>
      </section>

      {feed.saved.length > 0 ? (
        <section className="kp-shell mt-8 max-w-5xl space-y-6">
          <h2 className="font-serif text-2xl text-ink">Saved for later</h2>
          <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {feed.saved.map((article) => (
              <ArticleCard
                article={{
                  id: article.id,
                  slug: article.slug,
                  title: article.title,
                  subtitle: article.subtitle,
                  cover_image_url: article.coverImageUrl,
                  published_at: article.publishedAt,
                  category_name: article.categoryName,
                  author_name: article.authorName,
                  is_premium: article.isPremium,
                }}
                key={article.id}
              />
            ))}
          </div>
        </section>
      ) : null}

      {kinpressCards.length > 0 ? (
        <section className="kp-shell mt-10 max-w-5xl space-y-6">
          <h2 className="font-serif text-2xl text-ink">KinPress for you</h2>
          <ul className="grid min-w-0 gap-3 sm:grid-cols-2">
            {kinpressCards.map((article) => (
              <li className="min-w-0" key={article.id}>
                <StoryRowCard article={article} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {feed.headlines.length > 0 ? (
        <section className="kp-shell mt-10 max-w-5xl space-y-6 pb-12">
          <h2 className="font-serif text-2xl text-ink">Headlines you may like</h2>
          <ul className="grid min-w-0 gap-3">
            {feed.headlines.map((article) => (
              <li className="min-w-0" key={article.id}>
                <StoryRowCard article={article} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!hasContent ? (
        <section className="kp-shell mt-10 max-w-5xl border border-dashed border-ink/25 p-10 text-center">
          <p className="font-serif text-2xl text-ink">Your feed is warming up.</p>
          <p className="mt-3 text-sm text-ink/65">
            Save KinPress stories or browse{" "}
            <Link className="font-bold text-heritage hover:underline" href="/">
              Top Stories
            </Link>
            .
          </p>
        </section>
      ) : null}
    </main>
  );
}
