import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { CategoryPill } from "@/components/category-pill";
import { FeaturedArticle } from "@/components/featured-article";
import type { ArticleRecord, CategoryRecord } from "@/lib/content";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getHomepageData() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      articles: [] as ArticleRecord[],
      featuredArticle: null as ArticleRecord | null,
      categories: [] as CategoryRecord[],
    };
  }

  const [articlesResult, featuredResult, categoriesResult] = await Promise.all([
    supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(12),
    supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (articlesResult.error) {
    console.error("Unable to load articles", articlesResult.error.message);
  }

  if (featuredResult.error) {
    console.error("Unable to load featured article", featuredResult.error.message);
  }

  if (categoriesResult.error) {
    console.error("Unable to load categories", categoriesResult.error.message);
  }

  return {
    articles: (articlesResult.data ?? []) as ArticleRecord[],
    featuredArticle: (featuredResult.data ?? null) as ArticleRecord | null,
    categories: (categoriesResult.data ?? []) as CategoryRecord[],
  };
}

export default async function Home() {
  const { articles, featuredArticle, categories } = await getHomepageData();
  const hasArticles = articles.length > 0;

  return (
    <main className="min-h-screen min-w-0">
      <section className="kp-shell flex flex-col gap-10 py-8 sm:gap-12 sm:py-10">
        <section className="grid gap-6 border-b border-ink/15 pb-8 sm:gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div className="grid min-w-0 gap-4 sm:gap-5">
            <p className="kp-eyebrow">News / Culture / Archive</p>
            <h1 className="kp-display max-w-4xl text-ink">
              The Black community, reported with depth and remembered with care.
            </h1>
          </div>

          <div className="min-w-0 border-t-4 border-gold pt-4 lg:border-t-0 lg:border-l-4 lg:pt-0 lg:pl-5">
            <p className="max-w-xl text-base leading-7 text-ink/75 sm:text-lg sm:leading-8">
              KinPress covers the stories, debates, art, labor, joy, and power
              shaping Black life today while building a premium cultural record
              for tomorrow.
            </p>
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border border-ink/15 bg-paper p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-brown">
              In focus
            </p>
            <p className="mt-2 text-sm leading-7 text-ink/75 sm:text-base">
              Reporting and conversations across politics, history, business, labor,
              arts, and community life.
            </p>
          </div>
          <Link className="kp-btn-outline w-fit" href="/search">
            Explore stories
          </Link>
        </section>

        {featuredArticle ? (
          <FeaturedArticle article={featuredArticle} />
        ) : hasArticles ? (
          <section className="border-y border-ink bg-deep-green p-8 text-bone sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-gold">
              Featured
            </p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
              Featured story coming soon.
            </h2>
          </section>
        ) : null}

        <section className="grid gap-5">
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-serif text-3xl text-ink">Sections</h2>
            <span className="h-px flex-1 bg-ink/20" />
          </div>

          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {categories.map((category, index) => (
                <CategoryPill
                  category={category}
                  key={category.id ?? category.slug ?? index}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-ink/25 bg-paper px-4 py-3 text-sm leading-6 text-ink/70">
              Categories are being curated. Check back as sections are published.
            </p>
          )}
        </section>

        <section className="grid gap-6">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-muted-brown">
                Latest
              </p>
              <h2 className="mt-2 font-serif text-4xl text-ink">New stories</h2>
            </div>
            <span className="hidden h-px flex-1 bg-ink/20 sm:block" />
          </div>

          {hasArticles ? (
            <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <ArticleCard article={article} key={article.id ?? article.slug ?? index} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-ink/30 bg-paper p-10 text-center">
              <p className="font-serif text-3xl text-ink">
                The first stories are on deck. Check back soon.
              </p>
            </div>
          )}
        </section>

        <section className="kp-invert-band grid gap-5 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-gold">
              KinPress membership
            </p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
              A newsroom and archive built for the people who keep culture moving.
            </h2>
          </div>
          <Link className="kp-btn-outline w-fit sm:w-auto" href="/signup">
            Join the list
          </Link>
        </section>
      </section>
    </main>
  );
}
