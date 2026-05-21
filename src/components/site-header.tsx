import Link from "next/link";
import { Suspense } from "react";
import { Menu } from "lucide-react";

import { KinPressLogo } from "@/components/kinpress-logo";
import { MastheadMobileMenu } from "@/components/masthead-mobile-menu";
import { HeaderAuthActions } from "@/components/header-auth-actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { getMastheadSession } from "@/lib/masthead-session";
import { KINPRESS_TAGLINE_SHORT } from "@/lib/brand";
import { primaryNavLinks, utilityNavLinks } from "@/lib/masthead-nav";

export async function SiteHeader() {
  const { isLoggedIn, showAdmin } = await getMastheadSession();
  const navLinks = showAdmin
    ? [...primaryNavLinks, { label: "Admin", href: "/admin" }]
    : primaryNavLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-ink/15 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="kp-shell py-3 sm:py-4">
        <HeaderTopRow isLoggedIn={isLoggedIn} showAdmin={showAdmin} />
        <nav
          aria-label="Primary"
          className="kp-pill-scroll mt-3 hidden border-t border-ink/10 pt-3 md:block"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {navLinks.map((link) => (
              <Link
                className="rounded-full border border-ink/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-muted-brown transition hover:border-heritage/40 hover:text-foreground"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
            <span aria-hidden className="mx-1 h-4 w-px bg-ink/15" />
            {utilityNavLinks.map((link) => (
              <Link
                className="text-[11px] font-black uppercase tracking-[0.12em] text-muted-brown transition hover:text-foreground"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

function MobileMenuFallback() {
  return (
    <button
      aria-hidden
      className="kp-icon-button pointer-events-none opacity-60 md:hidden"
      tabIndex={-1}
      type="button"
    >
      <Menu className="size-5" />
    </button>
  );
}

function HeaderTopRow({
  isLoggedIn,
  showAdmin,
}: {
  isLoggedIn: boolean;
  showAdmin: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <KinPressLogo className="min-w-0 shrink" priority />
      <p className="hidden min-w-0 truncate text-[11px] font-black uppercase tracking-[0.2em] text-muted-brown lg:block">
        {KINPRESS_TAGLINE_SHORT}
      </p>
      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        <ThemeToggle />
        <HeaderAuthActions
          className="hidden sm:flex"
          isLoggedIn={isLoggedIn}
          linkClassName="inline-flex"
        />
        <Suspense fallback={<MobileMenuFallback />}>
          <MastheadMobileMenu isLoggedIn={isLoggedIn} showAdmin={showAdmin} />
        </Suspense>
      </div>
    </div>
  );
}
