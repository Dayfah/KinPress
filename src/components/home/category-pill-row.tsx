"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { homeCategoryPills } from "@/lib/homepage-nav";
import { parseNewsCategorySlug } from "@/lib/news/categories";
import { cn } from "@/lib/utils";

export function CategoryPillRow() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = parseNewsCategorySlug(searchParams.get("category"));

  if (pathname !== "/") {
    return null;
  }

  return (
    <nav
      aria-label="Categories"
      className="kp-pill-scroll -mx-[var(--kp-shell-pad,1rem)] min-w-0 px-[var(--kp-shell-pad,1rem)]"
      id="sections"
    >
      <ul className="flex w-max min-w-full gap-2 pb-1">
        {homeCategoryPills.map((pill) => {
          const active = activeCategory === pill.slug;

          return (
            <li key={pill.slug} className="shrink-0">
              <Link
                className={cn("kp-home-pill", active && "kp-home-pill-active")}
                href={pill.href}
                scroll={false}
              >
                {pill.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
