"use client";

import { useState } from "react";

type SaveArticleButtonProps = {
  articleSlug: string;
};

export function SaveArticleButton({ articleSlug }: SaveArticleButtonProps) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={saved}
      data-article-slug={articleSlug}
      onClick={() => setSaved((current) => !current)}
      className="rounded-full border border-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-950 hover:text-white"
    >
      {saved ? "Saved" : "Save article"}
    </button>
  );
}
