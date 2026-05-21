import Link from "next/link";

import { EditorialArticleCard } from "@/components/editorial/editorial-article-card";
import { ThemeAwareLogo } from "@/components/kinpress-logo";
import { SupabaseConfigNotice } from "@/components/supabase-config-notice";
import { requireAuthenticatedUser } from "@/lib/auth/guards";
import { getForYouFeed } from "@/lib/for-you-feed";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ForYouPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <main className="min-h-screen min-w-0 overflow-x-hidden">
        <section className="kp-shell max-w-5xl py-10">
          <SupabaseConfigNotice title="For You unavailable" />
        </section>
      </main>
    );
  }

  const { user } = await requireAuthenticatedUser();
  const feed = await getForYouFeed(user.id);
  const hasContent = feed.saved.length > 0 || feed.recommended.length > 0;

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden">
      <section className="kp-shell max-w-5xl space-y-4 py-10">
        <ThemeAwareLogo className="mb-5" showWordmark={false} size="sm" />
        <p className="kp-eyebrow">For You</p>
        <h1 className="kp-heading font-semibold tracking-editorial text-ink">
          Picked for your reading list
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-ink/70 sm:text-base">
          {feed.interestLabels.length > 0
            ? `Stories aligned with your interests in ${feed.interestLabels.join(", ")}.`
            : "KinPress stories selected from across our editorial sections."}
        </p>
      </section>

      {feed.saved.length > 0 ? (
        <section className="kp-shell mt-8 max-w-5xl space-y-6">
          <h2 className="font-serif text-2xl text-ink">Saved for later</h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {feed.saved.map((article) => (
              <li key={article.id}>
                <EditorialArticleCard article={article} variant="compact" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {feed.recommended.length > 0 ? (
        <section className="kp-shell mt-10 max-w-5xl space-y-6 pb-12">
          <h2 className="font-serif text-2xl text-ink">Recommended for you</h2>
          <ul className="grid gap-6 sm:grid-cols-2">
            {feed.recommended.map((article) => (
              <li key={article.id}>
                <EditorialArticleCard article={article} variant="compact" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!hasContent ? (
        <section className="kp-shell mt-10 max-w-5xl rounded-2xl border border-dashed border-ink/25 p-10 text-center">
          <p className="font-serif text-2xl text-ink">Your feed is warming up</p>
          <p className="mt-3 text-sm text-ink/65">
            Save stories or browse the{" "}
            <Link className="font-bold text-heritage hover:underline" href="/">
              homepage
            </Link>
            .
          </p>
        </section>
      ) : null}
    </main>
  );
}
