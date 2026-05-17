import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import type { ArticleRecord } from "@/lib/content";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

/** Strip ilike metacharacters and commas so `.or()` filter strings stay safe. */
function sanitizeSearchTerm(raw: string) {
  return raw.replace(/[%_,\\]/g, " ").replace(/,/g, " ").replace(/\s+/g, " ").trim();
}

function buildPublishedArticleOrIlike(sanitizedTerm: string) {
  const inner = sanitizedTerm.replace(/"/g, '""');
  const pattern = `"%${inner}%"`;

  return [
    `title.ilike.${pattern}`,
    `subtitle.ilike.${pattern}`,
    `summary.ilike.${pattern}`,
    `category_name.ilike.${pattern}`,
  ].join(",");
}

async function searchPublishedArticles(term: string): Promise<{
  articles: ArticleRecord[];
}> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { articles: [] };
  }

  const sanitized = sanitizeSearchTerm(term);

  if (!sanitized) {
    return { articles: [] };
  }

  const orFilter = buildPublishedArticleOrIlike(sanitized);

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .or(orFilter)
    .order("published_at", { ascending: false })
    .limit(48);

  if (error) {
    console.error("Search failed", error.message);
    return { articles: [] };
  }

  return { articles: (data ?? []) as ArticleRecord[] };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = typeof params?.q === "string" ? params.q : "";
  const query = rawQuery.trim();
  const hasQuery = query.length > 0;

  const { articles } = hasQuery
    ? await searchPublishedArticles(query)
    : { articles: [] as ArticleRecord[] };

  return (
    <main className="min-h-screen min-w-0">
      <section className="kp-shell flex w-full max-w-5xl flex-col gap-8 py-10">
        <header className="space-y-2 border-b border-ink/15 pb-8">
          <p className="kp-eyebrow">Search</p>
          <h1 className="kp-heading font-semibold tracking-editorial text-ink">
            Find a story
          </h1>
        </header>

        <form action="/search" className="flex flex-col gap-3 sm:flex-row sm:items-end" method="get" role="search">
          <label className="grid flex-1 gap-2 text-sm font-bold text-ink">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-brown">
              Keywords
            </span>
            <input
              className="kp-input rounded-xl text-base outline-none transition focus:border-heritage"
              defaultValue={query}
              name="q"
              placeholder="Title, subtitle, summary, or category…"
              type="search"
            />
          </label>
          <button className="kp-btn-primary w-full sm:w-auto" type="submit">
            Search
          </button>
        </form>

        {!hasQuery ? (
          <p className="text-lg leading-8 text-ink/70">Search KinPress stories.</p>
        ) : articles.length === 0 ? (
          <p className="font-serif text-2xl text-ink">No stories found.</p>
        ) : (
          <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2">
            {articles.map((article, index) => (
              <ArticleCard article={article} key={String(article.id ?? article.slug ?? index)} />
            ))}
          </div>
        )}

        <p className="text-sm text-ink/55">
          <Link className="font-bold text-heritage underline-offset-4 hover:underline" href="/">
            Back to home
          </Link>
        </p>
      </section>
    </main>
  );
}
