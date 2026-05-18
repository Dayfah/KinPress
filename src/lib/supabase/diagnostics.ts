import { ARTICLE_COLUMNS } from "@/lib/editorial/columns";
import { formatSupabaseError } from "@/lib/supabase/errors";
import { getPublicSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/env";
import { maskSupabaseKey } from "@/lib/supabase/debug";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DiagnosticCheck = {
  name: string;
  ok: boolean;
  detail: string;
};

export type SupabaseDiagnosticsReport = {
  checkedAt: string;
  envConfigured: boolean;
  envUrl: string | null;
  keyType: "publishable" | "anon" | "missing";
  keyPreview: string | null;
  serviceRoleDetected: boolean;
  checks: DiagnosticCheck[];
};

export async function runSupabaseDiagnostics(): Promise<SupabaseDiagnosticsReport> {
  const checks: DiagnosticCheck[] = [];
  const env = getPublicSupabaseEnv();
  const envConfigured = isSupabaseConfigured();

  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const keyType = publishable ? "publishable" : anon ? "anon" : "missing";

  const serviceRoleDetected = Boolean(process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY?.trim());

  if (serviceRoleDetected && process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    checks.push({
      name: "Security",
      ok: false,
      detail:
        "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY is set — remove it. Service role must never use NEXT_PUBLIC_.",
    });
  } else {
    checks.push({
      name: "Security",
      ok: !process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
      detail: "No service role key exposed via NEXT_PUBLIC_ (expected).",
    });
  }

  checks.push({
    name: "Env vars",
    ok: envConfigured,
    detail: envConfigured
      ? `URL present; using ${keyType} key (${maskSupabaseKey(env!.anonKey)}).`
      : "Missing NEXT_PUBLIC_SUPABASE_URL and/or publishable/anon key.",
  });

  const supabase = await createSupabaseServerClient();

  checks.push({
    name: "Server client",
    ok: Boolean(supabase),
    detail: supabase
      ? "createSupabaseServerClient() returned a client."
      : "Server client is null — env vars missing.",
  });

  if (!supabase) {
    return {
      checkedAt: new Date().toISOString(),
      envConfigured,
      envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? null,
      keyType,
      keyPreview: env ? maskSupabaseKey(env.anonKey) : null,
      serviceRoleDetected,
      checks,
    };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  checks.push({
    name: "auth.getSession()",
    ok: !sessionError,
    detail: sessionError
      ? formatSupabaseError(sessionError.message)
      : sessionData.session
        ? `Session active for ${sessionData.session.user.email ?? sessionData.session.user.id}`
        : "No session (anonymous visitor).",
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();

  checks.push({
    name: "auth.getUser()",
    ok: !userError,
    detail: userError
      ? formatSupabaseError(userError.message)
      : userData.user
        ? `User ${userData.user.email ?? userData.user.id}`
        : "No authenticated user.",
  });

  const { data: articles, error: articlesError, count } = await supabase
    .from("articles")
    .select(ARTICLE_COLUMNS, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);

  const sampleSlugs = (articles ?? []).map((row) => row.slug).join(", ") || "none";

  checks.push({
    name: "Read articles",
    ok: !articlesError,
    detail: articlesError
      ? formatSupabaseError(articlesError.message, articlesError.code)
      : `Published count (approx): ${count ?? articles?.length ?? 0}. Sample slugs: ${sampleSlugs}`,
  });

  const { data: profileRow, error: profileError } = userData.user
    ? await supabase
        .from("profiles")
        .select("id, role, display_name")
        .eq("id", userData.user.id)
        .maybeSingle()
    : { data: null, error: null };

  checks.push({
    name: "Read profile",
    ok: userData.user ? !profileError && Boolean(profileRow) : true,
    detail: !userData.user
      ? "Skipped — log in to test profiles table."
      : profileError
        ? formatSupabaseError(profileError.message, profileError.code)
        : profileRow
          ? `Profile OK (role: ${profileRow.role ?? "reader"}).`
          : "No profile row — run /api/auth/setup or check handle_new_user trigger.",
  });

  return {
    checkedAt: new Date().toISOString(),
    envConfigured,
    envUrl: env?.url ?? null,
    keyType,
    keyPreview: env ? maskSupabaseKey(env.anonKey) : null,
    serviceRoleDetected,
    checks,
  };
}
