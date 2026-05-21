import Link from "next/link";

import {
  EventCard,
  OpportunityCard,
  ResourceCard,
} from "@/components/community/community-card";
import type {
  CommunityEvent,
  CommunityOpportunity,
  CommunityResource,
} from "@/lib/community/types";

type CommunityHighlightsProps = {
  events: CommunityEvent[];
  opportunities: CommunityOpportunity[];
  resources: CommunityResource[];
};

export function CommunityHighlights({
  events,
  opportunities,
  resources,
}: CommunityHighlightsProps) {
  const hasItems = resources.length > 0 || opportunities.length > 0 || events.length > 0;

  if (!hasItems) {
    return null;
  }

  return (
    <section className="space-y-5" aria-labelledby="community-highlights-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="kp-eyebrow">Resources</p>
          <h2
            className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl"
            id="community-highlights-heading"
          >
            Useful now
          </h2>
        </div>
        <Link className="kp-btn-ghost shrink-0 text-xs uppercase tracking-[0.12em]" href="/resources">
          Explore
        </Link>
      </div>

      <ul className="kp-rail-scroll flex min-w-0 gap-4 overflow-x-auto pb-2">
        {resources.slice(0, 2).map((resource) => (
          <li className="w-[min(85vw,20rem)] shrink-0 sm:w-80" key={`resource-${resource.id}`}>
            <ResourceCard resource={resource} />
          </li>
        ))}
        {opportunities.slice(0, 2).map((opportunity) => (
          <li className="w-[min(85vw,20rem)] shrink-0 sm:w-80" key={`opportunity-${opportunity.id}`}>
            <OpportunityCard opportunity={opportunity} />
          </li>
        ))}
        {events.slice(0, 2).map((event) => (
          <li className="w-[min(85vw,20rem)] shrink-0 sm:w-80" key={`event-${event.id}`}>
            <EventCard event={event} />
          </li>
        ))}
      </ul>
    </section>
  );
}
