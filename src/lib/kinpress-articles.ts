import { cache } from "react";

import type { ArticleRecord } from "@/lib/content";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getKinPressHomeArticles = cache(async function getKinPressHomeArticles(
  limit = 6,
) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { featured: null as ArticleRecord | null, recent: [] as ArticleRecord[] };
  }

  const [featuredRes, recentRes] = await Promise.all([
    supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle<ArticleRecord>(),
    supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit),
  ]);

  const featured = featuredRes.data ?? null;
  const recent = (recentRes.data ?? []) as ArticleRecord[];

  const featuredId = featured?.id;
  const rest = recent.filter((article) => article.id !== featuredId);

  return { featured, recent: rest };
});

export type AdminArticleRow = {
  id: string;
  title: string | null;
  slug: string | null;
  status: string | null;
  published_at: string | null;
  is_featured: boolean | null;
  category_name: string | null;
};

export async function getArticlesForAdmin(): Promise<AdminArticleRow[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug, status, published_at, is_featured, category_name")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(100);

  if (error) {
    throw new Error(`Unable to load articles: ${error.message}`);
  }

  return data ?? [];
}
