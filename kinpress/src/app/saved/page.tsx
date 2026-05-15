import { ArticleCard } from "@/components/article-card";
import { articles } from "@/lib/utils";

export default function SavedPage() {
  const savedArticles = articles.slice(0, 2);

  return (
    <div>
      <div className="rounded-[2rem] bg-white p-8 shadow-sm md:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-700">Reading list</p>
        <h1 className="mt-3 text-4xl font-black text-neutral-950">Saved articles</h1>
        <p className="mt-4 max-w-2xl text-neutral-600">
          Keep the stories, resources, and conversations you want to revisit.
        </p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {savedArticles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
