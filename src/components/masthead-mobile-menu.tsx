"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, X } from "lucide-react";

import { HeaderAuthActions } from "@/components/header-auth-actions";
import { KinPressLogo } from "@/components/kinpress-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { isHomeCategoryNavActive, isNavLinkActive } from "@/lib/nav-active";
import { readerMobileUtilityLinks, readerSectionLinks } from "@/lib/masthead-nav";
import { cn } from "@/lib/utils";

type MastheadMobileMenuProps = {
  isLoggedIn: boolean;
  showAdmin: boolean;
};

const drawerLinkBase =
  "flex min-h-12 min-w-0 items-center rounded-xl px-4 py-3 text-[17px] font-semibold leading-snug tracking-tight transition active:scale-[0.99]";

function DrawerNavLink({
  active,
  href,
  label,
}: {
  active: boolean;
  href: string;
  label: string;
}) {
  return (
    <SheetClose asChild>
      <Link
        aria-current={active ? "page" : undefined}
        className={cn(
          drawerLinkBase,
          active
            ? "bg-white/12 text-white"
            : "text-white/88 hover:bg-white/8 hover:text-white",
        )}
        href={href}
      >
        {label}
      </Link>
    </SheetClose>
  );
}

export function MastheadMobileMenu({ isLoggedIn, showAdmin }: MastheadMobileMenuProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const adminLink = showAdmin ? { label: "Admin", href: "/admin" } : null;

  function linkIsActive(href: string, homeCategory?: string) {
    return isHomeCategoryNavActive(pathname, searchParams, homeCategory, href);
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button aria-label="Open menu" className="kp-icon-button md:hidden" type="button">
          <Menu className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        className="flex h-[100dvh] max-h-[100dvh] w-[min(100vw,20.5rem)] max-w-[100vw] flex-col gap-0 overflow-hidden border-white/10 bg-[#141210] p-0 text-white shadow-2xl sm:max-w-[20.5rem]"
        overlayClassName="bg-black/55 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-lg"
        showCloseButton={false}
        side="right"
      >
        <SheetTitle className="sr-only">KinPress navigation</SheetTitle>

        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <KinPressLogo className="text-white [&_span]:text-white" showWordmark />
          <SheetClose asChild>
            <button
              aria-label="Close menu"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/90 transition hover:bg-white/10"
              type="button"
            >
              <X className="size-5" />
            </button>
          </SheetClose>
        </header>

        <nav
          aria-label="Reader"
          className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-4"
        >
          <section aria-labelledby="mobile-nav-sections" className="min-w-0">
            <h2
              className="px-4 pb-2 pt-1 text-[11px] font-black uppercase tracking-[0.22em] text-white/45"
              id="mobile-nav-sections"
            >
              Sections
            </h2>
            <ul className="grid min-w-0 gap-1">
              {readerSectionLinks.map((link) => (
                <li className="min-w-0" key={link.href}>
                  <DrawerNavLink
                    active={linkIsActive(link.href, link.homeCategory)}
                    href={link.href}
                    label={link.label}
                  />
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="mobile-nav-library"
            className="mt-6 min-w-0 border-t border-white/10 pt-6"
          >
            <h2
              className="px-4 pb-2 text-[11px] font-black uppercase tracking-[0.22em] text-white/45"
              id="mobile-nav-library"
            >
              Library
            </h2>
            <ul className="grid min-w-0 gap-1">
              {readerMobileUtilityLinks.map((link) => (
                <li className="min-w-0" key={link.href}>
                  <DrawerNavLink
                    active={isNavLinkActive(pathname, link.href)}
                    href={link.href}
                    label={link.label}
                  />
                </li>
              ))}
              {adminLink ? (
                <li className="min-w-0">
                  <DrawerNavLink
                    active={isNavLinkActive(pathname, adminLink.href)}
                    href={adminLink.href}
                    label={adminLink.label}
                  />
                </li>
              ) : null}
            </ul>
          </section>
        </nav>

        <footer
          aria-label="Account"
          className="shrink-0 border-t border-white/10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
        >
          <div className="mb-4 flex items-center justify-between gap-3 px-1">
            <span className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">
              Account
            </span>
            <ThemeToggle className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-white/90 transition hover:bg-white/10" />
          </div>
          <HeaderAuthActions
            isLoggedIn={isLoggedIn}
            variant="drawer"
            wrapLink={(child) => <SheetClose asChild>{child}</SheetClose>}
          />
        </footer>
      </SheetContent>
    </Sheet>
  );
}
