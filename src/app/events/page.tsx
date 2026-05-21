import { EventCard } from "@/components/community/community-card";
import { ContentEmptyState } from "@/components/editorial/content-empty-state";
import { ThemeAwareLogo } from "@/components/kinpress-logo";
import { SupabaseConfigNotice } from "@/components/supabase-config-notice";
import { SupabaseQueryError } from "@/components/supabase-query-error";
import { getEvents } from "@/lib/community/content";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="min-h-screen min-w-0 overflow-x-hidden">
        <section className="kp-shell max-w-5xl py-10">
          <SupabaseConfigNotice title="Events unavailable" />
        </section>
      </main>
    );
  }

  const { items, error } = await getEvents();

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden">
      <section className="kp-shell max-w-6xl space-y-8 py-10">
        <header className="border-b border-ink/15 pb-8">
          <ThemeAwareLogo className="mb-5" showWordmark={false} size="sm" />
          <p className="kp-eyebrow">Events</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Community calendars, talks, festivals, trainings, and gatherings.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/70 sm:text-base">
            Verified events with source links and dates maintained by KinPress.
          </p>
        </header>

        {error ? <SupabaseQueryError message={error} title="Could not load events" /> : null}

        {items.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        ) : (
          <ContentEmptyState
            description="Verified events will appear here after the events ingestion job runs or editors publish approved records."
            primaryHref="/resources"
            primaryLabel="View resources"
            secondaryHref="/opportunities"
            secondaryLabel="View opportunities"
            title="No verified events yet"
          />
        )}
      </section>
    </main>
  );
}
