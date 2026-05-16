import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-ink/15 bg-bone">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto]">
        <div>
          <p className="font-serif text-xl font-bold text-ink">KinPress</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink/70">
            Independent journalism, practical resources, and community conversation
            for the Black diaspora.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm font-bold text-muted-brown">
          <Link className="transition hover:text-ink" href="/admin">
            Admin
          </Link>
          <Link className="transition hover:text-ink" href="/login">
            Log in
          </Link>
          <Link className="transition hover:text-ink" href="/signup">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
