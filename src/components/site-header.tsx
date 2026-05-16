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
    <header className="sticky top-0 z-40 border-b border-ink/15 bg-paper/95 backdrop-blur">
      <div className="kp-shell py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link className="font-serif text-2xl font-bold tracking-tight text-ink" href="/">
            KinPress
          </Link>
          <p className="hidden text-[11px] font-black uppercase tracking-[0.2em] text-muted-brown sm:block">
            Black News · Culture · Community
          </p>
          <div className="flex shrink-0 items-center gap-2.5">
            <Link className="text-sm font-bold text-ink/80 transition hover:text-ink" href="/login">
              Log in
            </Link>
            <Link
              className="rounded-full bg-ink px-4 py-2 text-xs font-black uppercase tracking-[0.13em] text-bone transition hover:bg-heritage"
              href="/signup"
            >
              Join
            </Link>
          </div>
        </div>
        <nav className="mt-3 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-3 md:gap-4">
          {navCategories.map((category, index) => {
            const slug =
              typeof category.slug === "string" ? category.slug : null;
            if (!slug) {
              return null;
            }

            return (
              <Link
                className="rounded-full border border-ink/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-muted-brown transition hover:border-ink/35 hover:text-ink"
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
            className="text-xs font-black uppercase tracking-[0.14em] text-muted-brown transition hover:text-ink"
            href="/search"
          >
            Search
          </Link>
          <Link
            className="text-xs font-black uppercase tracking-[0.14em] text-muted-brown transition hover:text-ink"
            href="/saved"
          >
            Saved
          </Link>
          <Link
            className="text-xs font-black uppercase tracking-[0.14em] text-muted-brown transition hover:text-ink"
            href="/profile"
          >
            Profile
          </Link>
          <Link
            className="text-xs font-black uppercase tracking-[0.14em] text-muted-brown transition hover:text-ink"
            href="/admin"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
