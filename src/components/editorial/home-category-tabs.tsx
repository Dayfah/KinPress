"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isNavLinkActive } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Top Stories", href: "/" },
  { label: "For You", href: "/for-you" },
  { label: "Latest", href: "/latest" },
  { label: "Politics", href: "/topic/politics" },
  { label: "Culture", href: "/topic/culture" },
  { label: "Business", href: "/topic/business" },
  { label: "Health", href: "/topic/health" },
  { label: "Tech", href: "/topic/tech" },
  { label: "History", href: "/topic/history" },
  { label: "Local", href: "/topic/local" },
  { label: "Resources", href: "/resources" },
  { label: "Opinion", href: "/topic/opinion" },
];

export function HomeCategoryTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="KinPress sections" className="kp-pill-scroll -mx-4 px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-0 gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <li className="shrink-0" key={tab.href}>
            <Link
              aria-current={isNavLinkActive(pathname, tab.href) ? "page" : undefined}
              className={cn(
                "kp-home-pill",
                isNavLinkActive(pathname, tab.href) && "kp-home-pill-active",
              )}
              href={tab.href}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
