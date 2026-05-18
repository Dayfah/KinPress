"use client";

import { useState, type FormEvent } from "react";

import { runSavedArticleDebugTest } from "@/app/debug/supabase/actions";

type SaveTestFormProps = {
  defaultArticleId: string | null;
  isLoggedIn: boolean;
};

export function SaveTestForm({ defaultArticleId, isLoggedIn }: SaveTestFormProps) {
  const [articleId, setArticleId] = useState(defaultArticleId ?? "");
  const [result, setResult] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setResult(null);

    const response = await runSavedArticleDebugTest(articleId);
    setResult(response.ok ? `OK: ${response.message}` : `Failed: ${response.message}`);
    setPending(false);
  }

  if (!isLoggedIn) {
    return (
      <p className="text-sm text-ink/70">
        <a className="font-bold text-heritage underline" href="/login?next=/debug/supabase">
          Log in
        </a>{" "}
        to run the saved_articles insert/delete test.
      </p>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block text-sm font-bold text-ink">
        Article UUID to test
        <input
          className="kp-auth-input mt-2 font-mono text-xs"
          onChange={(event) => setArticleId(event.target.value)}
          placeholder="Published article id"
          required
          value={articleId}
        />
      </label>
      <button className="kp-btn-primary" disabled={pending} type="submit">
        {pending ? "Testing…" : "Test save insert + delete"}
      </button>
      {result ? (
        <p className="rounded-lg border border-ink/15 bg-card p-3 font-mono text-xs" role="status">
          {result}
        </p>
      ) : null}
    </form>
  );
}
