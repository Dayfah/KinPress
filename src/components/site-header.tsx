import Link from "next/link";

import { KinPressLogo } from "@/components/kinpress-logo";
import { MastheadMobileMenu } from "@/components/masthead-mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import type { CategoryRecord } from "@/lib/content";
import { mastheadLinks } from "@/lib/masthead-nav";
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
    <header className="sticky top-0 z-40 border-b border-ink/15 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="kp-shell py-3 sm:py-4">
        <HeaderTopRow categories={navCategories} />
        <nav
          aria-label="Primary"
          className="mt-3 hidden flex-wrap items-center gap-3 border-t border-ink/10 pt-3 md:flex md:gap-4"
        >
          {navCategories.map((category, index) => {
            const slug = typeof category.slug === "string" ? category.slug : null;
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
          {mastheadLinks.map((link) => (
            <Link
              className="text-xs font-black uppercase tracking-[0.14em] text-muted-brown transition hover:text-ink"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function HeaderTopRow({ categories }: { categories: CategoryRecord[] }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <KinPressLogo className="min-w-0 shrink" />
      <p className="hidden min-w-0 truncate text-[11px] font-black uppercase tracking-[0.2em] text-muted-brown lg:block">
        Black News · Culture · Community
      </p>
      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        <ThemeToggle />
        <Link className="kp-btn-ghost hidden text-sm sm:inline-flex" href="/login">
          Log in
        </Link>
        <Link className="kp-btn-primary hidden text-xs sm:inline-flex" href="/signup">
          Join
        </Link>
        <MastheadMobileMenu categories={categories} />
      </div>
    </div>
  );
}
