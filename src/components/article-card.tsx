/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ArticleRecord } from "@/lib/content";
import {
  firstText,
  formatPublishedDate,
  getArticleCategory,
  getArticleExcerpt,
  getArticleHref,
  getArticleImage,
} from "@/lib/content";

type SupabaseArticleCardProps = {
  article: ArticleRecord;
};

export type ArticleCardProps = {
  id?: string;
  title: string;
  slug: string;
  subtitle: string;
  coverImageUrl?: string | null;
  categoryName?: string;
  authorName?: string;
  publishedAt: string | Date;
  isPremium?: boolean;
};

type ArticleCardInput = SupabaseArticleCardProps | ArticleCardProps;

function normalizeArticleCardProps(props: ArticleCardInput) {
  if ("article" in props) {
    const { article } = props;

    return {
      id: article.id,
      title: firstText(article, ["title"], "Untitled story"),
      href: getArticleHref(article),
      image: getArticleImage(article),
      excerpt: getArticleExcerpt(article),
      category: getArticleCategory(article),
      author: firstText(article, ["author_name"]),
      dateTime: article.published_at ?? undefined,
      date: formatPublishedDate(article.published_at),
      isPremium: Boolean(article.is_premium),
    };
  }

  return {
    id: props.id,
    title: props.title,
    href: `/articles/${props.slug.replace(/^\/+/, "")}`,
    image: props.coverImageUrl ?? "",
    excerpt: props.subtitle,
    category: props.categoryName ?? "",
    author: props.authorName ?? "",
    dateTime:
      props.publishedAt instanceof Date
        ? props.publishedAt.toISOString()
        : props.publishedAt,
    date: formatPublishedDate(
      props.publishedAt instanceof Date
        ? props.publishedAt.toISOString()
        : props.publishedAt,
    ),
    isPremium: Boolean(props.isPremium),
  };
}

export function ArticleCard(props: ArticleCardInput) {
  const article = normalizeArticleCardProps(props);

  return (
    <article
      data-article-id={article.id}
      className="group flex h-full flex-col border-t border-ink/15 pt-5"
    >
      <Link className="grid h-full gap-4" href={article.href}>
        {article.image ? (
          <div className="aspect-[4/3] overflow-hidden bg-ink/10">
            <img
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              src={article.image}
            />
          </div>
        ) : null}

        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-brown">
            {article.category ? <span>{article.category}</span> : null}
            {article.category && article.date ? <span aria-hidden="true">/</span> : null}
            {article.date ? <time dateTime={article.dateTime}>{article.date}</time> : null}
            {article.isPremium ? (
              <>
                <span aria-hidden="true">/</span>
                <span>KinPress+</span>
              </>
            ) : null}
          </div>

          <h3 className="font-serif text-2xl leading-tight text-ink transition group-hover:text-heritage">
            {article.title}
          </h3>

          {article.excerpt ? (
            <p className="line-clamp-3 text-sm leading-6 text-ink/70">
              {article.excerpt}
            </p>
          ) : null}

          {article.author ? (
            <p className="mt-auto text-xs font-bold uppercase tracking-[0.18em] text-muted-brown">
              By {article.author}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}

export default ArticleCard;
