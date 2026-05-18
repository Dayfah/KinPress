import Link from "next/link";

import { ARTICLE_TOPICS } from "@/lib/editorial/types";
import { TOPIC_LABELS } from "@/lib/masthead-nav";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SectionsPage() {
  const supabase = await createSupabaseServerClient();
  let categories: { name: string; slug: string }[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("categories")
      .select("name, slug")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    categories = (data ?? []).map((row) => ({
      name: row.name ?? row.slug,
      slug: row.slug,
    }));
  }

  return (
    <main className="kp-home min-h-screen min-w-0 overflow-x-hidden">
      <section className="kp-shell max-w-5xl space-y-10 py-10">
        <header className="min-w-0 border-b border-ink/15 pb-6">
          <p className="kp-eyebrow">Sections</p>
          <h1 className="mt-2 font-serif text-4xl font-bold text-ink">Browse by topic</h1>
          <p className="mt-3 text-sm leading-7 text-ink/70">
            Culture, politics, history, business, art, and community — reported with depth, clarity, and style.
          </p>
        </header>

        <div className="space-y-8">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-ink">Topics</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {ARTICLE_TOPICS.map((topic) => (
                <li key={topic}>
                  <Link
                    className="kp-home-card block px-5 py-4 font-semibold text-ink transition hover:text-heritage"
                    href={`/topic/${topic}`}
                  >
                    {TOPIC_LABELS[topic] ?? topic}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {categories.length > 0 ? (
            <section>
              <h2 className="font-serif text-2xl font-semibold text-ink">Categories</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      className="kp-home-card block px-5 py-4 font-semibold text-ink transition hover:text-heritage"
                      href={`/categories/${category.slug}`}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
