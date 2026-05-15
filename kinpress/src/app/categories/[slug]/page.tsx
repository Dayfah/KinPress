import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { CategoryPill } from "@/components/category-pill";
import { categories, getArticlesByCategory, getCategoryBySlug } from "@/lib/utils";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  return {
    title: category ? `${category.name} | KinPress` : "Category | KinPress"
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const categoryArticles = getArticlesByCategory(category.slug);

  return (
    <div>
      <div className="rounded-[2rem] bg-white p-8 shadow-sm md:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-700">Category</p>
        <h1 className="mt-3 text-4xl font-black text-neutral-950">{category.name}</h1>
        <p className="mt-4 max-w-2xl text-neutral-600">
          Read the latest KinPress reporting and essays in {category.name.toLowerCase()}.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {categories.map((item) => (
            <CategoryPill key={item.slug} {...item} active={item.slug === category.slug} />
          ))}
        </div>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {categoryArticles.length > 0 ? (
          categoryArticles.map((article) => <ArticleCard key={article.slug} article={article} />)
        ) : (
          <p className="rounded-3xl bg-white p-6 text-neutral-600">No articles in this category yet.</p>
        )}
      </div>
    </div>
  );
}
