/** True when `pathname` matches a nav href (home is exact-only). */
export function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  if (href.startsWith("/?")) {
    return false;
  }

  if (href.startsWith("/#")) {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isHomeCategoryNavActive(
  pathname: string,
  searchParams: URLSearchParams,
  homeCategory: string | undefined,
  href: string,
) {
  if (!homeCategory) {
    if (href === "/") {
      return pathname === "/" && !searchParams.get("category");
    }

    return isNavLinkActive(pathname, href);
  }

  if (pathname !== "/") {
    return false;
  }

  const active = searchParams.get("category") ?? "top-stories";

  if (homeCategory === "top-stories") {
    return active === "top-stories";
  }

  return active === homeCategory;
}
