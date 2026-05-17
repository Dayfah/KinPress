import Link from "next/link";

export default function NotFound() {
  return (
    <main className="kp-home min-h-[60vh] min-w-0 overflow-x-hidden">
      <section className="kp-shell mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:py-24">
        <p className="kp-eyebrow">404</p>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 text-sm leading-7 text-ink/70 sm:text-base">
          This story or section is not available. Head back to Top Stories to
          keep reading.
        </p>
        <Link className="kp-btn-primary mt-8" href="/">
          Back to Today
        </Link>
      </section>
    </main>
  );
}
