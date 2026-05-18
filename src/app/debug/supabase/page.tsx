import Link from "next/link";
import { notFound } from "next/navigation";

import { SaveTestForm } from "@/app/debug/supabase/save-test-form";
import { isSupabaseDebugEnabled } from "@/lib/supabase/debug";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { runSupabaseDiagnostics } from "@/lib/supabase/diagnostics";

export const dynamic = "force-dynamic";

export default async function DebugSupabasePage() {
  if (!isSupabaseDebugEnabled()) {
    notFound();
  }

  const report = await runSupabaseDiagnostics();
  const browserClientOk = isSupabaseConfigured();

  const sessionUser = report.checks.find((c) => c.name === "auth.getUser()")?.detail ?? "";
  const isLoggedIn = sessionUser.startsWith("User ");

  const articlesCheck = report.checks.find((c) => c.name === "Read articles");
  const sampleArticleId = await getFirstPublishedArticleId();

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden">
      <div className="kp-shell mx-auto max-w-3xl space-y-8 py-10">
        <header className="space-y-2 border-b border-ink/15 pb-6">
          <p className="kp-eyebrow">Debug</p>
          <h1 className="font-serif text-3xl font-bold text-ink">Supabase connection</h1>
          <p className="text-sm text-ink/70">
            Temporary diagnostics for KinPress ↔ Supabase. Enabled in development or when{" "}
            <code className="rounded bg-card px-1">NEXT_PUBLIC_ENABLE_SUPABASE_DEBUG=true</code>.
          </p>
          <p className="font-mono text-xs text-muted-foreground">Checked {report.checkedAt}</p>
        </header>

        <section className="kp-home-card space-y-3 p-5">
          <h2 className="font-serif text-xl font-semibold text-ink">Environment</h2>
          <ul className="space-y-2 font-mono text-xs text-ink/80">
            <li>Configured: {report.envConfigured ? "yes" : "no"}</li>
            <li>URL: {report.envUrl ?? "—"}</li>
            <li>Key type: {report.keyType}</li>
            <li>Key preview: {report.keyPreview ?? "—"}</li>
            <li>Browser createClient(): {browserClientOk ? "ok" : "failed"}</li>
          </ul>
        </section>

        <section className="kp-home-card space-y-3 p-5">
          <h2 className="font-serif text-xl font-semibold text-ink">Checks</h2>
          <ul className="space-y-3">
            {report.checks.map((check) => (
              <li
                className="rounded-lg border border-ink/10 bg-bone/50 px-4 py-3 dark:bg-card/50"
                key={check.name}
              >
                <p className="flex items-center gap-2 text-sm font-bold text-ink">
                  <span
                    aria-hidden
                    className={
                      check.ok
                        ? "size-2 rounded-full bg-deep-green"
                        : "size-2 rounded-full bg-heritage"
                    }
                  />
                  {check.name}
                </p>
                <p className="mt-1 text-sm leading-6 text-ink/75">{check.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="kp-home-card space-y-4 p-5">
          <h2 className="font-serif text-xl font-semibold text-ink">saved_articles test</h2>
          <p className="text-sm text-ink/70">
            Inserts a row for your user, then deletes it. Uses real RLS policies.
          </p>
          {!articlesCheck?.ok ? (
            <p className="text-sm text-heritage">Fix article read errors before testing saves.</p>
          ) : null}
          <SaveTestForm defaultArticleId={sampleArticleId} isLoggedIn={isLoggedIn} />
        </section>

        <p className="text-center text-sm">
          <Link className="font-bold text-heritage hover:underline" href="/">
            ← Back to homepage
          </Link>
        </p>
      </div>
    </main>
  );
}

async function getFirstPublishedArticleId(): Promise<string | null> {
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("articles")
    .select("id")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>();

  return data?.id ?? null;
}
