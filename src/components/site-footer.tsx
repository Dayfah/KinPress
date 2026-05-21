import Link from "next/link";

import { KinPressLogo } from "@/components/kinpress-logo";
import { KINPRESS_TAGLINE_SHORT } from "@/lib/brand";
import { getMastheadSession } from "@/lib/masthead-session";

export async function SiteFooter() {
  const { showAdmin } = await getMastheadSession();

  return (
    <footer className="mt-16 border-t border-white/10 bg-[#111111] text-[#f5f0e8]">
      <div className="kp-shell grid gap-8 py-10 sm:py-12 md:grid-cols-[1fr_auto] md:items-start">
        <div className="min-w-0">
          <KinPressLogo showWordmark tone="onDark" />
          <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-gold">
            {KINPRESS_TAGLINE_SHORT}
          </p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-bone/75">
            Black-centered digital news with depth, clarity, and style.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-bold text-bone/85 sm:gap-5">
          {showAdmin ? (
            <Link className="transition hover:text-gold" href="/admin">
              Admin
            </Link>
          ) : null}
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
