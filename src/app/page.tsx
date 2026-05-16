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
    <main className="min-h-screen">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 py-8 sm:px-8 lg:px-10">
        <section className="grid gap-8 py-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div className="grid gap-5">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-heritage">
              News / Culture / Archive
            </p>
            <h1 className="max-w-4xl font-serif text-5xl leading-[0.95] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              The Black community, reported with depth and remembered with care.
            </h1>
          </div>

          <div className="border-l-4 border-gold pl-5">
            <p className="max-w-xl text-lg leading-8 text-ink/75">
              KinPress covers the stories, debates, art, labor, joy, and power
              shaping Black life today while building a premium cultural record
              for tomorrow.
            </p>
          </div>
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
            <p className="text-sm leading-6 text-ink/65">
              Categories will appear here once they are active.
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
            <div className="border border-dashed border-ink/30 bg-bone/75 p-10 text-center">
              <p className="font-serif text-3xl text-ink">
                No stories published yet. Check back soon.
              </p>
            </div>
          )}
        </section>

        <section className="grid gap-5 bg-ink p-8 text-bone sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-gold">
              KinPress membership
            </p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
              A newsroom and archive built for the people who keep culture moving.
            </h2>
          </div>
          <Link
            className="inline-flex w-fit rounded-full bg-bone px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-ink transition hover:bg-gold"
            href="/signup"
          >
            Join the list
          </Link>
        </section>
      </section>
    </main>
  );
}
