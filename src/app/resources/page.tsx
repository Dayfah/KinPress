import { ResourceCard } from "@/components/community/community-card";
import { ContentEmptyState } from "@/components/editorial/content-empty-state";
import { ThemeAwareLogo } from "@/components/kinpress-logo";
import { SupabaseConfigNotice } from "@/components/supabase-config-notice";
import { SupabaseQueryError } from "@/components/supabase-query-error";
import { getResources } from "@/lib/community/content";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="min-h-screen min-w-0 overflow-x-hidden">
        <section className="kp-shell max-w-5xl py-10">
          <SupabaseConfigNotice title="Resources unavailable" />
        </section>
      </main>
    );
  }

  const { items, error } = await getResources();

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden">
      <section className="kp-shell max-w-6xl space-y-8 py-10">
        <header className="border-b border-ink/15 pb-8">
          <ThemeAwareLogo className="mb-5" showWordmark={false} size="sm" />
          <p className="kp-eyebrow">Resources</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Useful support for Black readers and communities.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/70 sm:text-base">
            Verified programs, organizations, guides, and services with source links.
          </p>
        </header>

        {error ? <SupabaseQueryError message={error} title="Could not load resources" /> : null}

        {items.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((resource) => (
              <li key={resource.id}>
                <ResourceCard resource={resource} />
              </li>
            ))}
          </ul>
        ) : (
          <ContentEmptyState
            description="Verified resources will appear here after the resources ingestion job runs or editors publish approved records."
            primaryHref="/opportunities"
            primaryLabel="View opportunities"
            secondaryHref="/events"
            secondaryLabel="View events"
            title="No verified resources yet"
          />
        )}
      </section>
    </main>
  );
}
