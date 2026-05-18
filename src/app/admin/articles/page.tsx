import Link from "next/link";

import { requireAdmin } from "@/lib/auth/guards";
import { getArticlesForAdmin } from "@/lib/editorial/articles";
import { formatPublishedDate } from "@/lib/content";

export const dynamic = "force-dynamic";

type AdminArticlesPageProps = {
  searchParams?: Promise<{
    view?: string;
  }>;
};

const VIEWS = [
  { id: "all", label: "All" },
  { id: "drafts", label: "Drafts" },
  { id: "published", label: "Published" },
  { id: "featured", label: "Featured" },
  { id: "picks", label: "Editor picks" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

function filterArticles(
  articles: Awaited<ReturnType<typeof getArticlesForAdmin>>,
  view: ViewId,
) {
  switch (view) {
    case "drafts":
      return articles.filter((article) => article.status !== "published");
    case "published":
      return articles.filter((article) => article.status === "published");
    case "featured":
      return articles.filter((article) => article.is_featured);
    case "picks":
      return articles.filter((article) => article.editor_pick);
    default:
      return articles;
  }
}

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const viewParam = params?.view ?? "all";
  const view = VIEWS.some((item) => item.id === viewParam) ? (viewParam as ViewId) : "all";
  const allArticles = await getArticlesForAdmin();
  const articles = filterArticles(allArticles, view);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <header className="mb-8 flex flex-col gap-4 border-b border-ink/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="kp-eyebrow">Admin / Articles</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold text-ink">Manage articles</h1>
          </div>
          <Link className="kp-btn-primary" href="/admin/articles/new">
            Create new article
          </Link>
        </header>

        <nav
          aria-label="Article filters"
          className="mb-6 flex flex-wrap gap-2"
        >
          {VIEWS.map((item) => (
            <Link
              className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] transition ${
                view === item.id
                  ? "border-heritage bg-heritage/10 text-heritage"
                  : "border-ink/15 text-muted-brown hover:border-ink/35 hover:text-ink"
              }`}
              href={item.id === "all" ? "/admin/articles" : `/admin/articles?view=${item.id}`}
              key={item.id}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {articles.length === 0 ? (
          <p className="text-sm text-ink/70">
            No articles in this view.{" "}
            <Link className="font-bold text-heritage hover:underline" href="/admin/articles/new">
              Create one
            </Link>
            .
          </p>
        ) : (
          <div className="overflow-x-auto border border-ink/15">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-ink/15 bg-bone/80 text-xs font-black uppercase tracking-[0.14em] text-muted-brown">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Published</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr className="border-b border-ink/10" key={article.id}>
                    <td className="px-4 py-3 font-medium text-ink">
                      {article.title ?? "Untitled"}
                      {article.is_featured ? (
                        <span className="ml-2 text-xs font-bold uppercase text-heritage">
                          Featured
                        </span>
                      ) : null}
                      {article.editor_pick ? (
                        <span className="ml-2 text-xs font-bold uppercase text-deep-green">
                          Pick
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 capitalize text-ink/75">{article.status}</td>
                    <td className="px-4 py-3 text-ink/75">{article.topic ?? "—"}</td>
                    <td className="px-4 py-3 text-ink/75">
                      {formatPublishedDate(article.published_at) || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {article.status === "published" && article.slug ? (
                        <Link
                          className="font-bold text-heritage hover:underline"
                          href={`/articles/${article.slug}`}
                        >
                          View
                        </Link>
                      ) : (
                        <span className="text-ink/45">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-6">
          <Link className="text-sm font-bold text-heritage hover:underline" href="/admin">
            Back to dashboard
          </Link>
        </p>
      </div>
    </main>
  );
}
