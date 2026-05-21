import Link from "next/link";
import { CalendarDays, ExternalLink, MapPin } from "lucide-react";

import type {
  CommunityEvent,
  CommunityOpportunity,
  CommunityResource,
} from "@/lib/community/types";

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function CardShell({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <article className="kp-community-card group">
      <Link href={href} rel="noopener noreferrer" target="_blank">
        {children}
      </Link>
    </article>
  );
}

function MetaRow({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 flex items-center gap-2 text-xs font-bold text-muted-brown">{children}</p>;
}

export function ResourceCard({ resource }: { resource: CommunityResource }) {
  return (
    <CardShell href={resource.source_url}>
      <p className="kp-eyebrow">{resource.category}</p>
      <h3 className="mt-2 font-serif text-xl font-bold leading-tight text-ink group-hover:text-heritage">
        {resource.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/70">{resource.description}</p>
      {resource.organization ? (
        <p className="mt-4 text-sm font-black uppercase tracking-[0.12em] text-ink">
          {resource.organization}
        </p>
      ) : null}
      <MetaRow>
        {resource.location ? (
          <>
            <MapPin className="size-4" />
            {resource.location}
          </>
        ) : (
          <>
            <ExternalLink className="size-4" />
            Verified resource
          </>
        )}
      </MetaRow>
    </CardShell>
  );
}

export function OpportunityCard({ opportunity }: { opportunity: CommunityOpportunity }) {
  const deadline = formatDate(opportunity.deadline);

  return (
    <CardShell href={opportunity.source_url}>
      <p className="kp-eyebrow">{opportunity.category}</p>
      <h3 className="mt-2 font-serif text-xl font-bold leading-tight text-ink group-hover:text-heritage">
        {opportunity.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/70">
        {opportunity.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.12em] text-muted-brown">
        {opportunity.amount ? <span>{opportunity.amount}</span> : null}
        {opportunity.organization ? <span>{opportunity.organization}</span> : null}
      </div>
      {deadline ? (
        <MetaRow>
          <CalendarDays className="size-4" />
          Deadline {deadline}
        </MetaRow>
      ) : null}
    </CardShell>
  );
}

export function EventCard({ event }: { event: CommunityEvent }) {
  const startsAt = formatDate(event.starts_at);

  return (
    <CardShell href={event.source_url}>
      <p className="kp-eyebrow">{event.category}</p>
      <h3 className="mt-2 font-serif text-xl font-bold leading-tight text-ink group-hover:text-heritage">
        {event.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/70">{event.description}</p>
      {event.organizer ? (
        <p className="mt-4 text-sm font-black uppercase tracking-[0.12em] text-ink">
          {event.organizer}
        </p>
      ) : null}
      <MetaRow>
        <CalendarDays className="size-4" />
        {startsAt ?? "Date at source"}
        {event.location ? ` · ${event.location}` : ""}
      </MetaRow>
    </CardShell>
  );
}
