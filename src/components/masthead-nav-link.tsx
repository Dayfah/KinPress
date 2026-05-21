"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isNavLinkActive } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

type MastheadNavLinkProps = {
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  href: string;
};

export function MastheadNavLink({
  activeClassName,
  children,
  className,
  href,
}: MastheadNavLinkProps) {
  const pathname = usePathname();
  const active = isNavLinkActive(pathname, href);

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(className, active && activeClassName)}
      href={href}
    >
      {children}
    </Link>
  );
}
