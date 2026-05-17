import { NextResponse } from "next/server";

import { parseNewsCategorySlug } from "@/lib/news/categories";
import { getCachedNewsArticles } from "@/lib/news/cache";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = parseNewsCategorySlug(searchParams.get("category"));

    const result = await getCachedNewsArticles(category);

    return NextResponse.json(
      {
        articles: result.articles,
        source: result.source,
        category: result.category,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    console.error("[KinPress] /api/news error", error);

    return NextResponse.json(
      {
        articles: [],
        source: "mock",
        category: "top-stories",
        error: "Unable to load news at this time.",
      },
      { status: 200 },
    );
  }
}
