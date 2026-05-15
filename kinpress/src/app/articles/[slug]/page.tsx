import { notFound } from "next/navigation";

import { CommentSection } from "@/components/comment-section";
import { SaveArticleButton } from "@/components/save-article-button";
import { articles, getArticleBySlug } from "@/lib/utils";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  return {
    title: article ? `${article.title} | KinPress` : "Article | KinPress",
    description: article?.excerpt
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm md:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-700">{article.category}</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-neutral-950 md:text-5xl">
          {article.title}
        </h1>
        <p className="mt-5 text-xl text-neutral-600">{article.excerpt}</p>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-neutral-200 py-5">
          <div className="text-sm text-neutral-600">
            <p className="font-bold text-neutral-950">{article.author}</p>
            <p>
              {article.publishedAt} · {article.readTime}
            </p>
          </div>
          <SaveArticleButton articleSlug={article.slug} />
        </div>
        <div className="prose mt-8">
          {article.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
      <CommentSection articleSlug={article.slug} />
    </article>
  );
}
