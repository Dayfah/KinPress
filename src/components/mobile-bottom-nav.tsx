"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Compass,
  Home,
  Search,
  User,
} from "lucide-react";

import { mobileBottomNavItems } from "@/lib/homepage-nav";
import { isNavLinkActive } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

const icons = {
  today: Home,
  sections: Compass,
  saved: Bookmark,
  search: Search,
  profile: User,
} as const;

function isBottomNavActive(pathname: string, href: string) {
  if (href === "/#sections") {
    return pathname === "/";
  }

  return isNavLinkActive(pathname, href);
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="kp-bottom-nav fixed inset-x-0 bottom-0 z-50 border-t border-ink/12 bg-paper/95 backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex max-w-lg min-w-0 items-stretch justify-around px-1 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))]">
        {mobileBottomNavItems.map((item) => {
          const Icon = icons[item.icon];
          const active = isBottomNavActive(pathname, item.href);

          return (
            <li className="min-w-0 flex-1" key={item.href}>
              <Link
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-bold leading-none transition",
                  active
                    ? "text-heritage"
                    : "text-muted-brown hover:text-ink",
                )}
                href={item.href}
              >
                <Icon
                  aria-hidden
                  className={cn("size-5 shrink-0", active && "stroke-[2.5]")}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
