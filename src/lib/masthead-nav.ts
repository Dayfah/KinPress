import type { ArticleTopic } from "@/lib/editorial/types";

export type ReaderNavItem = {
  label: string;
  href: string;
};

/** Main editorial sections (desktop header + mobile drawer). */
export const primaryNavLinks: ReaderNavItem[] = [
  { label: "Home", href: "/" },
  { label: "Culture", href: "/topic/culture" },
  { label: "Politics", href: "/topic/politics" },
  { label: "Business", href: "/topic/business" },
  { label: "History", href: "/topic/history" },
  { label: "Arts", href: "/topic/arts" },
  { label: "Opinion", href: "/topic/opinion" },
  { label: "Saved", href: "/saved" },
  { label: "Profile", href: "/profile" },
];

export const utilityNavLinks: ReaderNavItem[] = [
  { label: "Search", href: "/search" },
  { label: "Latest", href: "/latest" },
];

const adminLink: ReaderNavItem = { label: "Admin", href: "/admin" };

export function getMobileNavLinks(options: { showAdmin: boolean }): ReaderNavItem[] {
  const links = [...primaryNavLinks, ...utilityNavLinks];

  if (options.showAdmin) {
    return [...links, adminLink];
  }

  return links;
}

export const TOPIC_LABELS: Record<ArticleTopic, string> = {
  politics: "Politics",
  culture: "Culture",
  history: "History",
  business: "Business",
  arts: "Arts",
  justice: "Justice",
  education: "Education",
  health: "Health",
  community: "Community",
  opinion: "Opinion",
};

/** @deprecated */
export const readerSectionLinks = primaryNavLinks;
export const readerUtilityLinks = utilityNavLinks;
export const readerMobileUtilityLinks: ReaderNavItem[] = [];
export const mastheadLinks = primaryNavLinks;
