/**
 * Centralized environment validation for KinPress.
 * Safe to import from middleware (no throws) and from next.config / server (can assert).
 */

export type EnvIssue = {
  code: string;
  message: string;
  severity: "error" | "warning";
};

const PLACEHOLDER_KEY_PATTERNS = [
  /^your[-_]?anon[-_]?key$/i,
  /^your[-_]?publishable[-_]?key$/i,
  /^<your[-_]?.*>$/i,
  /^changeme$/i,
  /^xxx+$/i,
];

const PLACEHOLDER_URL_PATTERNS = [
  /^https?:\/\/<project-ref>\.supabase\.co\/?$/i,
  /^https?:\/\/your-project\.supabase\.co\/?$/i,
];

/** Decode JWT payload role without verifying signature (format check only). */
export function getJwtRole(key: string): string | null {
  const parts = key.split(".");
  if (parts.length < 2) {
    return null;
  }

  if (typeof atob !== "function") {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded)) as { role?: string };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export function isPlaceholderKey(key: string): boolean {
  const trimmed = key.trim();
  if (!trimmed || trimmed.length < 8) {
    return true;
  }
  return PLACEHOLDER_KEY_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function validateSupabaseProjectUrl(raw: string | undefined): EnvIssue | null {
  const value = raw?.trim();
  if (!value) {
    return {
      code: "SUPABASE_URL_MISSING",
      message: "NEXT_PUBLIC_SUPABASE_URL is not set.",
      severity: "error",
    };
  }

  if (PLACEHOLDER_URL_PATTERNS.some((p) => p.test(value))) {
    return {
      code: "SUPABASE_URL_PLACEHOLDER",
      message: "NEXT_PUBLIC_SUPABASE_URL is still a placeholder.",
      severity: "error",
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return {
      code: "SUPABASE_URL_INVALID",
      message: "NEXT_PUBLIC_SUPABASE_URL must be a full URL (e.g. https://your-ref.supabase.co).",
      severity: "error",
    };
  }

  if (parsed.protocol !== "https:") {
    return {
      code: "SUPABASE_URL_NOT_HTTPS",
      message: "NEXT_PUBLIC_SUPABASE_URL must use https:// in production.",
      severity: "error",
    };
  }

  if (!parsed.hostname.endsWith(".supabase.co")) {
    return {
      code: "SUPABASE_URL_HOST",
      message: "NEXT_PUBLIC_SUPABASE_URL hostname should end with .supabase.co.",
      severity: "warning",
    };
  }

  return null;
}

export function validatePublicAnonKey(raw: string | undefined): EnvIssue | null {
  const value = raw?.trim();
  if (!value) {
    return {
      code: "SUPABASE_KEY_MISSING",
      message:
        "Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      severity: "error",
    };
  }

  if (isPlaceholderKey(value)) {
    return {
      code: "SUPABASE_KEY_PLACEHOLDER",
      message: "Supabase public key looks like a placeholder — use the anon or publishable key from Supabase → API.",
      severity: "error",
    };
  }

  const role = getJwtRole(value);
  if (role === "service_role") {
    return {
      code: "SUPABASE_KEY_SERVICE_ROLE",
      message:
        "The configured public key is a service_role JWT. Use the anon or publishable key only — never expose service role to the browser.",
      severity: "error",
    };
  }

  return null;
}

export function validateSiteUrl(raw: string | undefined): EnvIssue | null {
  const value = raw?.trim();
  if (!value) {
    return {
      code: "SITE_URL_MISSING",
      message:
        "NEXT_PUBLIC_SITE_URL is not set. Auth redirects fall back to VERCEL_URL or localhost.",
      severity: "warning",
    };
  }

  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return {
        code: "SITE_URL_PROTOCOL",
        message: "NEXT_PUBLIC_SITE_URL must start with http:// or https://.",
        severity: "error",
      };
    }
  } catch {
    return {
      code: "SITE_URL_INVALID",
      message: "NEXT_PUBLIC_SITE_URL must be a full URL (e.g. https://kin-press.vercel.app).",
      severity: "error",
    };
  }

  return null;
}

export function collectDangerousPublicEnvIssues(): EnvIssue[] {
  const issues: EnvIssue[] = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    issues.push({
      code: "SERVICE_ROLE_EXPOSED",
      message:
        "Remove NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY. Service role must never use the NEXT_PUBLIC_ prefix.",
      severity: "error",
    });
  }

  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serverOnlyServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (serverOnlyServiceRole && publicKey?.trim() === serverOnlyServiceRole) {
    issues.push({
      code: "SERVICE_ROLE_AS_PUBLIC",
      message:
        "SUPABASE_SERVICE_ROLE_KEY must not be copied into NEXT_PUBLIC_SUPABASE_* — use the anon/publishable key for clients.",
      severity: "error",
    });
  }

  return issues;
}

export function collectPublicEnvIssues(options?: {
  requireSiteUrl?: boolean;
}): EnvIssue[] {
  const requireSiteUrl = options?.requireSiteUrl ?? false;
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const publicKey = publishable || anon;

  const issues: EnvIssue[] = [
    ...collectDangerousPublicEnvIssues(),
  ];

  const urlIssue = validateSupabaseProjectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (urlIssue) {
    issues.push(urlIssue);
  }

  const keyIssue = validatePublicAnonKey(publicKey);
  if (keyIssue) {
    issues.push(keyIssue);
  }

  const siteIssue = validateSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (siteIssue) {
    if (requireSiteUrl && siteIssue.severity === "warning") {
      issues.push({ ...siteIssue, severity: "error" });
    } else {
      issues.push(siteIssue);
    }
  }

  return issues;
}

export function formatEnvIssues(issues: EnvIssue[]): string {
  return issues
    .filter((i) => i.severity === "error")
    .map((i) => `  - [${i.code}] ${i.message}`)
    .join("\n");
}

/**
 * Returns true when URL + public key are present and pass basic safety checks.
 * Never throws — safe for Edge middleware.
 */
export function isPublicSupabaseEnvUsable(): boolean {
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const publicKey = publishable || anon;

  if (validateSupabaseProjectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    return false;
  }
  if (validatePublicAnonKey(publicKey)) {
    return false;
  }
  if (collectDangerousPublicEnvIssues().some((i) => i.severity === "error")) {
    return false;
  }

  return true;
}

/**
 * Fail the production build on Vercel/CI when required public env is missing or unsafe.
 * Set SKIP_ENV_VALIDATION=true to bypass (emergency only).
 */
export function assertProductionEnvForBuild(): void {
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    console.warn("[KinPress] SKIP_ENV_VALIDATION=true — env checks skipped.");
    return;
  }

  const isVercel = process.env.VERCEL === "1";
  const isCi = process.env.CI === "true";

  // Fail closed on Vercel/CI so misconfiguration surfaces at deploy time, not in middleware.
  if (!isVercel && !isCi) {
    return;
  }

  const issues = collectPublicEnvIssues({ requireSiteUrl: isVercel });
  const errors = issues.filter((i) => i.severity === "error");

  const blockingCodes = new Set([
    "SERVICE_ROLE_EXPOSED",
    "SERVICE_ROLE_AS_PUBLIC",
    "SUPABASE_KEY_SERVICE_ROLE",
  ]);

  const blocking = errors.filter((i) => blockingCodes.has(i.code));
  const warnings = errors.filter((i) => !blockingCodes.has(i.code));

  if (blocking.length > 0) {
    throw new Error(
      `KinPress build blocked — unsafe environment configuration:\n${formatEnvIssues(blocking)}\n\nSee .env.example and README.md.`,
    );
  }

  if (warnings.length > 0) {
    const header = isVercel
      ? "[KinPress] Vercel build env warnings (deploy continues; set Production env vars):"
      : "[KinPress] Build env warnings:";
    console.warn(`${header}\n${formatEnvIssues(warnings)}`);
  }
}
