import { ArticleCard } from "@/components/article-card";
import { CategoryPill } from "@/components/category-pill";
import { FeaturedArticle } from "@/components/featured-article";
import { articles, categories, getFeaturedArticle } from "@/lib/utils";

export default function HomePage() {
  const featuredArticle = getFeaturedArticle();
  const latestArticles = articles.filter((article) => article.slug !== featuredArticle.slug);

  return (
    <div className="space-y-12">
      <FeaturedArticle article={featuredArticle} />
      <section>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-700">Explore</p>
            <h2 className="mt-2 text-3xl font-black text-neutral-950">Black stories by topic</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <CategoryPill key={category.slug} {...category} />
            ))}
          </div>
        </div>
      </section>
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-black text-neutral-950">Latest articles</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {latestArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </section>
    </div>
  );
}
