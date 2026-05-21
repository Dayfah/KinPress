import { OpportunityCard } from "@/components/community/community-card";
import { ContentEmptyState } from "@/components/editorial/content-empty-state";
import { ThemeAwareLogo } from "@/components/kinpress-logo";
import { SupabaseConfigNotice } from "@/components/supabase-config-notice";
import { SupabaseQueryError } from "@/components/supabase-query-error";
import { getOpportunities } from "@/lib/community/content";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="min-h-screen min-w-0 overflow-x-hidden">
        <section className="kp-shell max-w-5xl py-10">
          <SupabaseConfigNotice title="Opportunities unavailable" />
        </section>
      </main>
    );
  }

  const { items, error } = await getOpportunities();

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden">
      <section className="kp-shell max-w-6xl space-y-8 py-10">
        <header className="border-b border-ink/15 pb-8">
          <ThemeAwareLogo className="mb-5" showWordmark={false} size="sm" />
          <p className="kp-eyebrow">Opportunities</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Grants, scholarships, jobs, fellowships, and programs.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/70 sm:text-base">
            Actionable listings for Black founders, students, creatives, workers, and families.
          </p>
        </header>

        {error ? (
          <SupabaseQueryError message={error} title="Could not load opportunities" />
        ) : null}

        {items.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((opportunity) => (
              <li key={opportunity.id}>
                <OpportunityCard opportunity={opportunity} />
              </li>
            ))}
          </ul>
        ) : (
          <ContentEmptyState
            description="Verified opportunities will appear here after the opportunities ingestion job runs or editors publish approved records."
            primaryHref="/resources"
            primaryLabel="View resources"
            secondaryHref="/events"
            secondaryLabel="View events"
            title="No verified opportunities yet"
          />
        )}
      </section>
    </main>
  );
}
