import Link from "next/link";

import type { Article } from "@/lib/utils";
import { SaveArticleButton } from "@/components/save-article-button";

type ArticleCardProps = {
  article: Article;
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4 text-sm text-neutral-500">
        <Link href={`/categories/${article.categorySlug}`} className="font-semibold text-amber-700">
          {article.category}
        </Link>
        <span>{article.readTime}</span>
      </div>
      <Link href={`/articles/${article.slug}`} className="group">
        <h3 className="text-2xl font-bold tracking-tight text-neutral-950 group-hover:text-amber-700">
          {article.title}
        </h3>
      </Link>
      <p className="mt-3 flex-1 text-neutral-600">{article.excerpt}</p>
      <div className="mt-8 flex items-center justify-between gap-4">
        <div className="text-sm">
          <p className="font-semibold text-neutral-950">{article.author}</p>
          <p className="text-neutral-500">{article.publishedAt}</p>
        </div>
        <SaveArticleButton articleSlug={article.slug} />
      </div>
    </article>
  );
}
