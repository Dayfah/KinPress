/** Mobile bottom navigation — core reader actions. */
export const mobileBottomNavItems = [
  { label: "Home", href: "/", icon: "today" as const },
  { label: "Discover", href: "/sections", icon: "sections" as const },
  { label: "Saved", href: "/saved", icon: "saved" as const },
  { label: "Listen", href: "/listen", icon: "listen" as const },
  { label: "Profile", href: "/profile", icon: "profile" as const },
] as const;
