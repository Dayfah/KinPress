/** Enable /debug/supabase in development or when explicitly toggled on Vercel. */
export function isSupabaseDebugEnabled(): boolean {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  return process.env.NEXT_PUBLIC_ENABLE_SUPABASE_DEBUG === "true";
}

export function maskSupabaseKey(key: string): string {
  if (key.length <= 12) {
    return "••••";
  }

  return `${key.slice(0, 6)}…${key.slice(-4)}`;
}
