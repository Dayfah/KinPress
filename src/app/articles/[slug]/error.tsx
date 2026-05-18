"use client";

import Link from "next/link";
import { useEffect } from "react";

type ArticleErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ArticleError({ error, reset }: ArticleErrorProps) {
  useEffect(() => {
    console.error("[KinPress] article error", error.message);
  }, [error]);

  return (
    <main className="min-h-[50vh]">
      <section className="kp-shell mx-auto max-w-lg px-4 py-16 text-center sm:py-20">
        <p className="kp-eyebrow">Article</p>
        <h1 className="mt-3 font-serif text-3xl font-bold text-ink sm:text-4xl">
          Couldn&apos;t load this story
        </h1>
        <p className="mt-4 text-sm leading-7 text-ink/70">
          The article may be unavailable, or there was a temporary connection issue.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button className="kp-btn-primary" onClick={reset} type="button">
            Reload
          </button>
          <Link className="kp-btn-outline" href="/">
            Top stories
          </Link>
        </div>
      </section>
    </main>
  );
}
