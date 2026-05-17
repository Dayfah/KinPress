import { newsCategoryConfigs } from "@/lib/news/categories";
import type { NewsCategorySlug } from "@/lib/news/types";

export type HomeCategoryPill = {
  label: string;
  slug: NewsCategorySlug;
  href: string;
};

/** Homepage horizontal category pills (Apple News–style). */
export const homeCategoryPills: HomeCategoryPill[] = newsCategoryConfigs.map(
  (config) => ({
    label: config.label,
    slug: config.slug,
    href:
      config.slug === "top-stories"
        ? "/"
        : `/?category=${encodeURIComponent(config.slug)}`,
  }),
);

export const mobileBottomNavItems = [
  { label: "Today", href: "/", icon: "today" as const },
  { label: "For You", href: "/for-you", icon: "sections" as const },
  { label: "Saved", href: "/saved", icon: "saved" as const },
  { label: "Search", href: "/search", icon: "search" as const },
  { label: "Profile", href: "/profile", icon: "profile" as const },
] as const;
