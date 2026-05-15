import type { CategoryRecord } from "@/lib/content";
import { firstText } from "@/lib/content";

type CategoryPillProps = {
  category: CategoryRecord;
};

export function CategoryPill({ category }: CategoryPillProps) {
  const name = firstText(category, ["name"], "Culture");
  const slug = firstText(category, ["slug"]);
  const href = slug ? `/categories/${slug}` : "#";

  return (
    <a
      className="rounded-full border border-ink/15 bg-bone px-4 py-2 text-sm font-semibold text-ink transition hover:border-heritage hover:text-heritage"
      href={href}
    >
      {name}
    </a>
  );
}
