import Link from "next/link";

import { requireAdmin } from "@/lib/auth/guards";
import { getArticlesForAdmin } from "@/lib/kinpress-articles";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { supabase } = await requireAdmin();

  const [articlesRes, categoriesRes, articles] = await Promise.all([
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    getArticlesForAdmin(),
  ]);

  const publishedCount = articlesRes.count ?? 0;
  const categoryCount = categoriesRes.count ?? 0;
  const draftCount = articles.filter((item) => item.status !== "published").length;

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-6 border border-ink/15 bg-card p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="kp-eyebrow">Admin</p>
            <h1 className="mt-3 font-serif text-4xl font-semibold tracking-editorial text-foreground sm:text-5xl">
              Editorial dashboard
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/70">
              Manage KinPress originals, review drafts, and publish to the homepage.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link
              className="kp-btn-primary inline-flex justify-center text-center"
              href="/admin/articles/new"
            >
              New article
            </Link>
            <Link
              className="kp-btn-ghost inline-flex justify-center text-center text-sm"
              href="/admin/articles"
            >
              Manage articles
            </Link>
          </div>
        </div>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="border border-ink/15 bg-card p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-brown">
              Published articles
            </p>
            <p className="mt-3 font-serif text-4xl text-ink">{publishedCount}</p>
          </div>
          <div className="border border-ink/15 bg-card p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-brown">
              Drafts & review
            </p>
            <p className="mt-3 font-serif text-4xl text-ink">{draftCount}</p>
          </div>
          <div className="border border-ink/15 bg-card p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-brown">
              Active categories
            </p>
            <p className="mt-3 font-serif text-4xl text-ink">{categoryCount}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
