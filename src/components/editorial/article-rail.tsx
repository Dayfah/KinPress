import Link from "next/link";

import { EditorialArticleCard } from "@/components/editorial/editorial-article-card";
import type { ArticleRail } from "@/lib/editorial/types";

type ArticleRailSectionProps = {
  rail: ArticleRail;
};

export function ArticleRailSection({ rail }: ArticleRailSectionProps) {
  if (rail.articles.length === 0) {
    return null;
  }

  const href =
    rail.id === "latest"
      ? "/latest"
      : `/search?topic=${encodeURIComponent(rail.articles[0]?.topic ?? "")}`;

  return (
    <section aria-labelledby={`rail-${rail.id}`} className="min-w-0 space-y-4">
      <div className="flex min-w-0 items-end justify-between gap-4">
        <h2
          className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl"
          id={`rail-${rail.id}`}
        >
          {rail.title}
        </h2>
        <Link className="kp-btn-ghost shrink-0 text-xs uppercase tracking-[0.12em]" href={href}>
          See all
        </Link>
      </div>

      <ul className="kp-rail-scroll flex min-w-0 gap-4 overflow-x-auto pb-2">
        {rail.articles.map((article) => (
          <li className="w-[min(85vw,18rem)] shrink-0 sm:w-72" key={article.id}>
            <EditorialArticleCard article={article} />
          </li>
        ))}
      </ul>
    </section>
  );
}
