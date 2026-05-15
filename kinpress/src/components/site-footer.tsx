import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-neutral-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xl font-black text-neutral-950">KinPress</p>
          <p className="mt-2 max-w-xl text-sm text-neutral-600">
            Independent journalism, practical resources, and community conversation for the Black
            diaspora.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm font-semibold text-neutral-600">
          <Link href="/admin" className="hover:text-neutral-950">
            Admin
          </Link>
          <Link href="/login" className="hover:text-neutral-950">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-neutral-950">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
