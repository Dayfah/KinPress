"use client";

import { useFormStatus } from "react-dom";

export function SubmitArticleButton() {
  const { pending } = useFormStatus();

  return (
    <button
      aria-disabled={pending}
      className="inline-flex justify-center rounded-full bg-ink px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-bone transition hover:bg-heritage disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      {pending ? "Uploading and saving..." : "Save article"}
    </button>
  );
}
