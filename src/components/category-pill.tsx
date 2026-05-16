import Link from "next/link";
import type { CategoryRecord } from "@/lib/content";
import { firstText } from "@/lib/content";

type CategoryPillProps = {
  category: CategoryRecord;
  isActive?: boolean;
};

export function CategoryPill({ category, isActive }: CategoryPillProps) {
  const name = firstText(category, ["name"], "Culture");
  const slug = firstText(category, ["slug"]);
  const href = slug ? `/categories/${slug}` : "#";

  return (
    <Link
      className={
        isActive
          ? "rounded-full border border-heritage bg-heritage/10 px-4 py-2 text-sm font-semibold text-heritage transition"
          : "rounded-full border border-ink/15 bg-bone px-4 py-2 text-sm font-semibold text-ink transition hover:border-heritage hover:text-heritage"
      }
      href={href}
    >
      {name}
    </Link>
  );
}
