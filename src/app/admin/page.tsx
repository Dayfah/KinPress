import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();

  let publishedCount = 0;
  let categoryCount = 0;

  if (supabase) {
    const [articlesRes, categoriesRes] = await Promise.all([
      supabase
        .from("articles")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("categories")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
    ]);

    publishedCount = articlesRes.count ?? 0;
    categoryCount = categoriesRes.count ?? 0;
  }

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
              Review publishing metrics and draft new KinPress articles.
            </p>
          </div>
          <Link
            className="kp-btn-primary inline-flex justify-center text-center"
            href="/admin/articles/new"
          >
            New article
          </Link>
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
              Active categories
            </p>
            <p className="mt-3 font-serif text-4xl text-ink">{categoryCount}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
