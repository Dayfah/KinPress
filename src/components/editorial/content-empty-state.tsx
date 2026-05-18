import Link from "next/link";

type ContentEmptyStateProps = {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function ContentEmptyState({
  title,
  description,
  primaryHref = "/latest",
  primaryLabel = "Browse latest",
  secondaryHref = "/search",
  secondaryLabel = "Search stories",
}: ContentEmptyStateProps) {
  return (
    <div className="kp-home-card px-6 py-12 text-center sm:py-16">
      <p className="kp-eyebrow">KinPress</p>
      <h2 className="mt-3 font-serif text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-ink/70 sm:text-base">
        {description}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link className="kp-btn-primary" href={primaryHref}>
          {primaryLabel}
        </Link>
        <Link className="kp-btn-outline" href={secondaryHref}>
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
