import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-ink/15 bg-ink text-bone">
      <div className="kp-shell grid gap-8 py-12 md:grid-cols-[1fr_auto]">
        <div>
          <p className="font-serif text-2xl font-bold">KinPress</p>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-gold">
            The Black Community
          </p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-bone/75">
            Independent journalism, practical resources, and community conversation
            for the Black diaspora.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm font-bold text-bone/80">
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
