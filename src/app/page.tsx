import { CommunityHighlights } from "@/components/community/community-highlights";
import { ArticleRailSection } from "@/components/editorial/article-rail";
import { HomeCategoryTabs } from "@/components/editorial/home-category-tabs";
import { HomeHero } from "@/components/editorial/home-hero";
import { SupabaseConfigNotice } from "@/components/supabase-config-notice";
import { SupabaseQueryError } from "@/components/supabase-query-error";
import { getEvents, getOpportunities, getResources } from "@/lib/community/content";
import { getHomepageData } from "@/lib/editorial/articles";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function Home() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="kp-home min-h-screen min-w-0 overflow-x-hidden">
        <div className="kp-shell mx-auto flex w-full max-w-6xl flex-col gap-8 py-8 sm:py-12">
          <SupabaseConfigNotice title="Stories unavailable" />
        </div>
      </main>
    );
  }

  const [
    { hero, rails, loadError },
    { items: resources },
    { items: opportunities },
    { items: events },
  ] = await Promise.all([
    getHomepageData(),
    getResources(4),
    getOpportunities(4),
    getEvents(4),
  ]);
  const hasContent = Boolean(hero.lead) || rails.length > 0;

  return (
    <main className="kp-home min-h-screen min-w-0 overflow-x-hidden">
      <div className="kp-shell mx-auto flex w-full max-w-6xl flex-col gap-10 py-5 sm:gap-12 sm:py-8 lg:py-10">
        {loadError ? (
          <SupabaseQueryError
            hint="Visit /debug/supabase in development, or confirm Vercel env vars and migrations."
            message={loadError}
          />
        ) : null}

        <HomeCategoryTabs />
        <HomeHero hero={hero} />

        {rails.map((rail) => (
          <ArticleRailSection key={rail.id} rail={rail} />
        ))}

        <CommunityHighlights
          events={events}
          opportunities={opportunities}
          resources={resources}
        />

        {!hasContent ? (
          <p className="text-center text-sm text-ink/65">
            Editorial stories will appear here after your Supabase project is seeded or an admin
            publishes articles.
          </p>
        ) : null}
      </div>
    </main>
  );
}
