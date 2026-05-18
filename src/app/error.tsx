"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[KinPress] app error", error.message);
  }, [error]);

  return (
    <main className="kp-home min-h-[60vh] min-w-0 overflow-x-hidden">
      <section className="kp-shell mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:py-24">
        <p className="kp-eyebrow">Something went wrong</p>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          We hit a snag
        </h1>
        <p className="mt-4 text-sm leading-7 text-ink/70 sm:text-base">
          KinPress could not load this page. Try again, or head back to today&apos;s stories.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button className="kp-btn-primary" onClick={reset} type="button">
            Try again
          </button>
          <Link className="kp-btn-outline" href="/">
            Back to Today
          </Link>
        </div>
      </section>
    </main>
  );
}
