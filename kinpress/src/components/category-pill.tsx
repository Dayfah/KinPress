import Link from "next/link";

import { cn } from "@/lib/utils";

type CategoryPillProps = {
  name: string;
  slug: string;
  active?: boolean;
};

export function CategoryPill({ name, slug, active }: CategoryPillProps) {
  return (
    <Link
      href={`/categories/${slug}`}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-semibold transition",
        active
          ? "border-neutral-950 bg-neutral-950 text-white"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-950"
      )}
    >
      {name}
    </Link>
  );
}
