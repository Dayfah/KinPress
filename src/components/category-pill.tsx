import { cn } from "@/lib/utils"

type CategoryPillProps = {
  name: string
  slug: string
}

export function CategoryPill({ name, slug }: CategoryPillProps) {
  return (
    <a
      href={`/categories/${encodeURIComponent(slug)}`}
      className={cn(
        "inline-flex max-w-full items-center rounded-full border px-3 py-1 text-xs font-medium leading-none tracking-[0.08em] uppercase",
        "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]",
        "transition-colors duration-200 hover:border-[var(--accent)] hover:bg-[var(--social-bg)] hover:text-[var(--accent)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
        "sm:text-sm",
      )}
    >
      <span className="truncate">{name}</span>
    </a>
  )
}

