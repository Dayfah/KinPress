"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { KinPressLogo } from "@/components/kinpress-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { mastheadLinks } from "@/lib/masthead-nav";

type MastheadMobileMenuProps = {
  categories: Array<{ id?: string | number; name?: string | null; slug?: string | null }>;
};

export function MastheadMobileMenu({ categories }: MastheadMobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button aria-label="Open menu" className="kp-icon-button md:hidden" type="button">
          <Menu className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent className="w-[min(100vw-2rem,22rem)] border-ink/15 bg-paper p-0" side="right">
        <SheetHeader className="border-b border-ink/10 px-5 py-4 text-left">
          <SheetTitle className="sr-only">KinPress navigation</SheetTitle>
          <KinPressLogo showWordmark />
        </SheetHeader>
        <nav className="flex max-h-[calc(100vh-5rem)] flex-col gap-6 overflow-y-auto px-5 py-6">
          <NavSection title="Sections">
            {categories.length > 0 ? (
              <ul className="grid gap-2">
                {categories.map((category, index) => {
                  const slug =
                    typeof category.slug === "string" ? category.slug : null;
                  if (!slug) {
                    return null;
                  }

                  const name =
                    typeof category.name === "string" && category.name.trim()
                      ? category.name
                      : slug;

                  return (
                    <li key={String(category.id ?? slug ?? index)}>
                      <SheetClose asChild>
                        <Link
                          className="block rounded-lg border border-ink/10 px-3 py-2 text-sm font-semibold text-ink transition hover:border-heritage/40 hover:bg-bone/60"
                          href={`/categories/${slug}`}
                        >
                          {name}
                        </Link>
                      </SheetClose>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-ink/65">Sections coming soon.</p>
            )}
          </NavSection>
          <NavSection title="KinPress">
            <ul className="grid gap-2">
              {mastheadLinks.map((link) => (
                <li key={link.href}>
                  <SheetClose asChild>
                    <Link
                      className="block rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-[0.12em] text-muted-brown transition hover:bg-bone/60 hover:text-ink"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>
          </NavSection>
          <NavSection title="Account">
            <AccountActions />
          </NavSection>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function NavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-3">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-brown">
        {title}
      </p>
      {children}
    </section>
  );
}

function AccountActions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ThemeToggle />
      <SheetClose asChild>
        <Link className="kp-btn-ghost text-sm" href="/login">
          Log in
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link className="kp-btn-primary text-xs" href="/signup">
          Join
        </Link>
      </SheetClose>
    </div>
  );
}
