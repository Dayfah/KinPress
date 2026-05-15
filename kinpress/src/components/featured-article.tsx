import Link from "next/link";

import type { Article } from "@/lib/utils";
import { SaveArticleButton } from "@/components/save-article-button";

type FeaturedArticleProps = {
  article: Article;
};

export function FeaturedArticle({ article }: FeaturedArticleProps) {
  return (
    <section className="grid gap-8 rounded-[2rem] bg-neutral-950 p-8 text-white md:grid-cols-[1.2fr_0.8fr] md:p-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">Featured story</p>
        <Link href={`/articles/${article.slug}`}>
          <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
            {article.title}
          </h1>
        </Link>
        <p className="mt-5 max-w-2xl text-lg text-neutral-300">{article.excerpt}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href={`/articles/${article.slug}`}
            className="rounded-full bg-amber-300 px-5 py-3 text-sm font-bold text-neutral-950 transition hover:bg-amber-200"
          >
            Read story
          </Link>
          <SaveArticleButton articleSlug={article.slug} />
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
        <p className="text-sm font-semibold text-amber-200">{article.category}</p>
        <p className="mt-6 text-2xl font-bold leading-snug">{article.body[0]}</p>
        <div className="mt-8 text-sm text-neutral-300">
          <p>{article.author}</p>
          <p>
            {article.publishedAt} · {article.readTime}
          </p>
        </div>
      </div>
    </section>
  );
}
