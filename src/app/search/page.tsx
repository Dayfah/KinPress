import Link from "next/link";

import { EditorialArticleCard } from "@/components/editorial/editorial-article-card";
import { ThemeAwareLogo } from "@/components/kinpress-logo";
import { searchEditorialArticles } from "@/lib/editorial/search";
import {
  ARTICLE_REGIONS,
  ARTICLE_TOPICS,
  type ArticleRegion,
  type ArticleTopic,
} from "@/lib/editorial/types";
import { TOPIC_LABELS } from "@/lib/masthead-nav";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
    topic?: string;
    region?: string;
    category?: string;
    from?: string;
  }>;
};

function parseTopic(value: string | undefined): ArticleTopic | undefined {
  if (value && ARTICLE_TOPICS.includes(value as ArticleTopic)) {
    return value as ArticleTopic;
  }
  return undefined;
}

function parseRegion(value: string | undefined): ArticleRegion | undefined {
  if (value && ARTICLE_REGIONS.includes(value as ArticleRegion)) {
    return value as ArticleRegion;
  }
  return undefined;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = typeof params?.q === "string" ? params.q : "";
  const query = rawQuery.trim();
  const topic = parseTopic(params?.topic);
  const region = parseRegion(params?.region);
  const category = typeof params?.category === "string" ? params.category.trim() : "";
  const fromDate = typeof params?.from === "string" ? params.from : undefined;

  const hasQuery = query.length > 0;
  const hasFilters = Boolean(topic || region || category || fromDate);

  const results =
    hasQuery || hasFilters
      ? await searchEditorialArticles(query, {
          topic,
          region,
          category: category || undefined,
          fromDate,
        })
      : [];

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden">
      <section className="kp-shell flex w-full max-w-5xl flex-col gap-8 py-10">
        <header className="space-y-2 border-b border-ink/15 pb-8">
          <ThemeAwareLogo className="mb-5" showWordmark={false} size="sm" />
          <p className="kp-eyebrow">Search</p>
          <h1 className="kp-heading font-semibold tracking-editorial text-ink">
            Find a story
          </h1>
          <p className="text-sm text-ink/65">
            Search KinPress by title, topic, author, category, or source.
          </p>
        </header>

        <form
          action="/search"
          className="grid gap-4 rounded-2xl border border-ink/15 bg-bone/40 p-5 sm:p-6"
          method="get"
          role="search"
        >
          <label className="grid flex-1 gap-2 text-sm font-bold text-ink">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-brown">
              Keywords
            </span>
            <input
              className="kp-input rounded-xl text-base outline-none transition focus:border-heritage"
              defaultValue={query}
              name="q"
              placeholder="Title, topic, tag, or author…"
              type="search"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="grid gap-2 text-sm font-bold text-ink">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-brown">
                Topic
              </span>
              <select className="kp-input rounded-xl" defaultValue={topic ?? ""} name="topic">
                <option value="">All topics</option>
                {ARTICLE_TOPICS.map((item) => (
                  <option key={item} value={item}>
                    {TOPIC_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-ink">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-brown">
                Region
              </span>
              <select className="kp-input rounded-xl" defaultValue={region ?? ""} name="region">
                <option value="">All regions</option>
                {ARTICLE_REGIONS.map((item) => (
                  <option key={item} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-ink">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-brown">
                Category
              </span>
              <input
                className="kp-input rounded-xl"
                defaultValue={category}
                name="category"
                placeholder="e.g. Culture"
                type="text"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-ink">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-brown">
                From date
              </span>
              <input
                className="kp-input rounded-xl"
                defaultValue={fromDate ?? ""}
                name="from"
                type="date"
              />
            </label>
          </div>

          <button className="kp-btn-primary w-full sm:w-auto sm:self-start" type="submit">
            Search
          </button>
        </form>

        {!hasQuery && !hasFilters ? (
          <p className="text-lg leading-8 text-ink/70">
            Enter keywords or choose filters to search the KinPress archive.
          </p>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/25 px-6 py-12 text-center">
            <p className="font-serif text-2xl text-ink">No stories found</p>
            <p className="mt-3 text-sm text-ink/65">
              Try different keywords or clear a filter to broaden your search.
            </p>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2">
            {results.map((article) => (
              <li key={article.id}>
                <EditorialArticleCard article={article} variant="compact" />
              </li>
            ))}
          </ul>
        )}

        <p className="text-sm text-ink/55">
          <Link
            className="font-bold text-heritage underline-offset-4 hover:underline"
            href="/"
          >
            Back to home
          </Link>
        </p>
      </section>
    </main>
  );
}
