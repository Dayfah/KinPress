import Link from "next/link";

import { KinPressLogo } from "@/components/kinpress-logo";
import { MastheadMobileMenu } from "@/components/masthead-mobile-menu";
import { HeaderAuthActions } from "@/components/header-auth-actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { getMastheadSession } from "@/lib/masthead-session";
import { readerSectionLinks, readerUtilityLinks } from "@/lib/masthead-nav";

export async function SiteHeader() {
  const { isLoggedIn, showAdmin } = await getMastheadSession();
  const utilityLinks = [
    ...readerUtilityLinks,
    ...(showAdmin ? [{ label: "Admin", href: "/admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink/15 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="kp-shell py-3 sm:py-4">
        <HeaderTopRow isLoggedIn={isLoggedIn} showAdmin={showAdmin} />
        <nav
          aria-label="Primary"
          className="mt-3 hidden flex-wrap items-center gap-2 border-t border-ink/10 pt-3 md:flex md:gap-2.5"
        >
          {readerSectionLinks.map((link) => (
            <Link
              className="rounded-full border border-ink/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-muted-brown transition hover:border-ink/35 hover:text-ink"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
          <span aria-hidden className="mx-1 hidden h-4 w-px bg-ink/15 lg:inline" />
          {utilityLinks.map((link) => (
            <Link
              className="text-xs font-black uppercase tracking-[0.14em] text-muted-brown transition hover:text-ink"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
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
      <KinPressLogo className="min-w-0 shrink" />
      <p className="hidden min-w-0 truncate text-[11px] font-black uppercase tracking-[0.2em] text-muted-brown lg:block">
        Black News · Culture · Community
      </p>
      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        <ThemeToggle />
        <HeaderAuthActions
          className="hidden sm:flex"
          isLoggedIn={isLoggedIn}
          linkClassName="inline-flex"
        />
        <MastheadMobileMenu isLoggedIn={isLoggedIn} showAdmin={showAdmin} />
      </div>
    </div>
  );
}
