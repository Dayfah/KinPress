/** Mobile bottom navigation — core reader actions. */
export const mobileBottomNavItems = [
  { label: "Home", href: "/", icon: "today" as const },
  { label: "Search", href: "/search", icon: "search" as const },
  { label: "Saved", href: "/saved", icon: "saved" as const },
  { label: "Profile", href: "/profile", icon: "profile" as const },
] as const;
