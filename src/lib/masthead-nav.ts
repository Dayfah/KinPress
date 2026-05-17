export type ReaderNavItem = {
  label: string;
  href: string;
  /** When set, active state uses `?category=` on the homepage. */
  homeCategory?: string;
};

/** Editorial destinations — Apple News–style reader sections. */
export const readerSectionLinks: ReaderNavItem[] = [
  { label: "Top Stories", href: "/" },
  { label: "For You", href: "/for-you" },
  {
    label: "Culture",
    href: "/?category=culture",
    homeCategory: "culture",
  },
  {
    label: "Politics",
    href: "/?category=politics",
    homeCategory: "politics",
  },
  {
    label: "Business",
    href: "/?category=business",
    homeCategory: "business",
  },
  { label: "Local", href: "/?category=local", homeCategory: "local" },
  { label: "History", href: "/?category=history", homeCategory: "history" },
  { label: "Arts", href: "/?category=arts", homeCategory: "arts" },
  { label: "Opinion", href: "/?category=opinion", homeCategory: "opinion" },
  { label: "KinPress Originals", href: "/#kinpress-originals" },
];

/** Desktop masthead utilities (auth lives in the header bar). */
export const readerUtilityLinks: ReaderNavItem[] = [
  { label: "Search", href: "/search" },
];

/** Mobile drawer: library + account destinations. */
export const readerMobileUtilityLinks: ReaderNavItem[] = [
  { label: "Saved", href: "/saved" },
  { label: "Search", href: "/search" },
  { label: "Profile", href: "/profile" },
];

const adminLink: ReaderNavItem = { label: "Admin", href: "/admin" };

export function getMobileNavLinks(options: { showAdmin: boolean }): ReaderNavItem[] {
  const links = [...readerSectionLinks, ...readerMobileUtilityLinks];

  if (options.showAdmin) {
    links.push(adminLink);
  }

  return links;
}

/** @deprecated Use getMobileNavLinks */
export function getReaderNavLinks(options: { showAdmin: boolean }): ReaderNavItem[] {
  return getMobileNavLinks(options);
}

/** @deprecated Use getReaderNavLinks — kept for any stale imports during transition. */
export const mastheadLinks = readerUtilityLinks;
