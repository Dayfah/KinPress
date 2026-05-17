import Link from "next/link";

import { KinPressLogo } from "@/components/kinpress-logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-ink/15 bg-ink text-bone">
      <div className="kp-shell grid gap-8 py-10 sm:py-12 md:grid-cols-[1fr_auto] md:items-start">
        <div className="min-w-0">
          <KinPressLogo className="text-bone" showWordmark />
          <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-gold">
            The Black Community
          </p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-bone/75">
            Independent journalism, practical resources, and community conversation
            for the Black diaspora.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-bold text-bone/85 sm:gap-5">
          <Link className="transition hover:text-gold" href="/admin">
            Admin
          </Link>
          <Link className="transition hover:text-gold" href="/login">
            Log in
          </Link>
          <Link className="transition hover:text-gold" href="/signup">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
