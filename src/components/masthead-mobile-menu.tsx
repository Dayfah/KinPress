"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { HeaderAuthActions } from "@/components/header-auth-actions";
import { KinPressLogo } from "@/components/kinpress-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getMobileNavLinks } from "@/lib/masthead-nav";
import { isNavLinkActive } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

type MastheadMobileMenuProps = {
  isLoggedIn: boolean;
  showAdmin: boolean;
};

const drawerLinkBase =
  "flex min-h-12 min-w-0 items-center rounded-xl px-4 py-3 text-[17px] font-semibold leading-snug tracking-tight transition active:scale-[0.99]";

export function MastheadMobileMenu({ isLoggedIn, showAdmin }: MastheadMobileMenuProps) {
  const pathname = usePathname();
  const links = getMobileNavLinks({ showAdmin });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button aria-label="Open menu" className="kp-icon-button md:hidden" type="button">
          <Menu className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        className="flex h-[100dvh] max-h-[100dvh] w-[min(100vw,20.5rem)] max-w-[100vw] flex-col gap-0 overflow-hidden border-white/10 bg-[#141210] p-0 text-white shadow-2xl sm:max-w-[20.5rem]"
        overlayClassName="bg-black/55 backdrop-blur-md"
        showCloseButton={false}
        side="right"
      >
        <SheetTitle className="sr-only">KinPress navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Browse KinPress sections, account links, and theme controls.
        </SheetDescription>

        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <KinPressLogo showWordmark tone="onDark" />
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
          aria-label="Main"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4"
        >
          <ul className="grid min-w-0 gap-1">
            {links.map((link) => {
              const active = isNavLinkActive(pathname, link.href);

              return (
                <li className="min-w-0" key={link.href}>
                  <SheetClose asChild>
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        drawerLinkBase,
                        active
                          ? "bg-white/12 text-white"
                          : "text-white/88 hover:bg-white/8 hover:text-white",
                      )}
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                </li>
              );
            })}
          </ul>
        </nav>

        <footer className="shrink-0 border-t border-white/10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">
              Account
            </span>
            <ThemeToggle className="relative inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-white/90 transition hover:bg-white/10" />
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
