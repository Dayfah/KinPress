"use client";

import { useFormStatus } from "react-dom";

export function SubmitArticleButton() {
  const { pending } = useFormStatus();

  return (
    <button
      aria-disabled={pending}
      className="kp-btn-primary inline-flex justify-center disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      {pending ? "Uploading and saving..." : "Save article"}
    </button>
  );
}
