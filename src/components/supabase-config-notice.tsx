import {
  SUPABASE_ENV_DEV_HINT,
  SUPABASE_ENV_USER_MESSAGE,
} from "@/lib/supabase/env";

type SupabaseConfigNoticeProps = {
  title?: string;
};

export function SupabaseConfigNotice({
  title = "Sign-in unavailable",
}: SupabaseConfigNoticeProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div
      className="rounded-2xl border border-heritage/30 bg-heritage/10 p-5 text-sm leading-6 text-foreground sm:p-6"
      role="status"
    >
      <p className="text-xs font-black uppercase tracking-[0.18em] text-heritage">
        {title}
      </p>
      <p className="mt-3">{SUPABASE_ENV_USER_MESSAGE}</p>
      {isDev ? (
        <p className="mt-3 rounded-lg border border-border/60 bg-card/80 p-3 font-mono text-xs leading-5 text-muted-foreground">
          {SUPABASE_ENV_DEV_HINT}
        </p>
      ) : null}
    </div>
  );
}
