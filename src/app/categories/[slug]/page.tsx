import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { CategoryPill } from "@/components/category-pill";
import type { ArticleRecord, CategoryRecord } from "@/lib/content";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { title: "KinPress" };
  }

  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  return {
    title: category?.name ? `${category.name} | KinPress` : "Category | KinPress",
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    notFound();
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id,name,slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (categoryError || !category?.id) {
    notFound();
  }

  const [articlesResult, categoriesResult] = await Promise.all([
    supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .eq("category_id", category.id)
      .order("published_at", { ascending: false }),
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (articlesResult.error) {
    throw new Error(`Unable to load articles: ${articlesResult.error.message}`);
  }

  const articles = (articlesResult.data ?? []) as ArticleRecord[];
  const categories = (categoriesResult.data ?? []) as CategoryRecord[];

  return (
    <main className="min-h-screen">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10">
        <header className="space-y-6 border-b border-ink/15 pb-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-heritage">
            Category
          </p>
          <h1 className="max-w-3xl font-serif text-5xl leading-tight tracking-editorial text-ink sm:text-6xl">
            {category.name ?? slug}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-ink/70">
            Read the latest KinPress reporting and essays in this section.
          </p>
          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {categories.map((item, index) => (
                <CategoryPill
                  category={item}
                  isActive={item.slug === slug}
                  key={String(item.id ?? item.slug ?? index)}
                />
              ))}
            </div>
          ) : null}
        </header>

        {articles.length > 0 ? (
          <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <ArticleCard article={article} key={String(article.id ?? article.slug ?? index)} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-ink/30 bg-bone/75 p-10 text-center">
            <p className="font-serif text-2xl text-ink">No stories in this category yet.</p>
          </div>
        )}
      </section>
    </main>
  );
}
