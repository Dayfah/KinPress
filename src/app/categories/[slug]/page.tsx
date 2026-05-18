import Link from "next/link";
import { notFound } from "next/navigation";

import { EditorialArticleCard } from "@/components/editorial/editorial-article-card";
import { CategoryPill } from "@/components/category-pill";
import { ARTICLE_COLUMNS } from "@/lib/editorial/columns";
import { normalizeArticle, type ArticleRow } from "@/lib/editorial/normalize";
import type { CategoryRecord } from "@/lib/content";
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
      .select(ARTICLE_COLUMNS)
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
    console.error("[KinPress] category articles", articlesResult.error.message);
  }

  const articles = (articlesResult.data ?? []).map((row) =>
    normalizeArticle(row as ArticleRow),
  );
  const categories = (categoriesResult.data ?? []) as CategoryRecord[];

  return (
    <main className="min-h-screen">
      <section className="kp-shell mx-auto flex w-full max-w-7xl flex-col gap-10 py-8 sm:py-10">
        <header className="space-y-6 border-b border-ink/15 pb-8">
          <p className="kp-eyebrow">Category</p>
          <h1 className="max-w-3xl font-serif text-4xl leading-tight tracking-editorial text-ink sm:text-5xl">
            {category.name ?? slug}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-ink/70">
            KinPress reporting and essays in this section.
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
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <li key={article.id}>
                <EditorialArticleCard article={article} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-ink/30 bg-bone/75 p-10 text-center">
            <p className="font-serif text-2xl text-ink">No stories in this category yet</p>
            <p className="mt-3 text-sm text-ink/65">
              <Link className="font-bold text-heritage hover:underline" href="/">
                Browse the homepage
              </Link>
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
