import Link from "next/link";

const navItems = [
  { href: "/categories/culture", label: "Culture" },
  { href: "/categories/business", label: "Business" },
  { href: "/saved", label: "Saved" },
  { href: "/profile", label: "Profile" }
];

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="text-2xl font-black tracking-tight text-neutral-950">
          KinPress
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-neutral-600 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-neutral-950">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-neutral-700 hover:text-neutral-950">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Join
          </Link>
        </div>
      </div>
    </header>
  );
}
