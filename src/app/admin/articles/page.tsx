import Link from "next/link";

import { requireAdmin } from "@/lib/auth/guards";
import { getArticlesForAdmin } from "@/lib/kinpress-articles";
import { formatPublishedDate } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  await requireAdmin();
  const articles = await getArticlesForAdmin();

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <header className="mb-8 flex flex-col gap-4 border-b border-ink/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="kp-eyebrow">Admin / Articles</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold text-ink">Manage articles</h1>
          </div>
          <Link className="kp-btn-primary" href="/admin/articles/new">
            New article
          </Link>
        </header>

        {articles.length === 0 ? (
          <p className="text-sm text-ink/70">No articles yet. Create your first KinPress story.</p>
        ) : (
          <div className="overflow-x-auto border border-ink/15">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-ink/15 bg-bone/80 text-xs font-black uppercase tracking-[0.14em] text-muted-brown">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Category</th>
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
                    </td>
                    <td className="px-4 py-3 capitalize text-ink/75">{article.status}</td>
                    <td className="px-4 py-3 text-ink/75">{article.category_name ?? "—"}</td>
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
