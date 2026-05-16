import Link from "next/link";

import type { CategoryRecord } from "@/lib/content";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  let navCategories: CategoryRecord[] = [];

  if (supabase) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(8);

    if (!error && data) {
      navCategories = data as CategoryRecord[];
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/15 bg-bone/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          className="font-serif text-2xl font-bold tracking-tight text-ink"
          href="/"
        >
          KinPress
        </Link>
        <nav className="hidden flex-wrap items-center justify-end gap-5 md:flex">
          {navCategories.map((category, index) => {
            const slug =
              typeof category.slug === "string" ? category.slug : null;
            if (!slug) {
              return null;
            }

            return (
              <Link
                className="text-xs font-black uppercase tracking-[0.16em] text-muted-brown transition hover:text-ink"
                href={`/categories/${slug}`}
                key={String(category.id ?? slug ?? index)}
              >
                {typeof category.name === "string" && category.name.trim()
                  ? category.name
                  : slug}
              </Link>
            );
          })}
          <Link
            className="text-xs font-black uppercase tracking-[0.16em] text-muted-brown transition hover:text-ink"
            href="/saved"
          >
            Saved
          </Link>
          <Link
            className="text-xs font-black uppercase tracking-[0.16em] text-muted-brown transition hover:text-ink"
            href="/profile"
          >
            Profile
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            className="text-sm font-bold text-ink/80 transition hover:text-ink"
            href="/login"
          >
            Log in
          </Link>
          <Link
            className="rounded-full bg-ink px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-bone transition hover:bg-heritage"
            href="/signup"
          >
            Join
          </Link>
        </div>
      </div>
    </header>
  );
}
