import { SUPABASE_ENV_SETUP_HINT } from "@/lib/supabase/env";

type SupabaseConfigNoticeProps = {
  title?: string;
};

export function SupabaseConfigNotice({
  title = "Sign-in unavailable",
}: SupabaseConfigNoticeProps) {
  return (
    <div
      className="rounded-2xl border border-heritage/30 bg-heritage/10 p-5 text-sm leading-6 text-ink sm:p-6"
      role="status"
    >
      <p className="text-xs font-black uppercase tracking-[0.18em] text-heritage">
        {title}
      </p>
      <p className="mt-3">{SUPABASE_ENV_SETUP_HINT}</p>
      {process.env.NODE_ENV === "development" ? (
        <p className="mt-3 text-xs text-ink/65">
          Local: copy <code className="font-mono">.env.example</code> to{" "}
          <code className="font-mono">.env.local</code> and restart{" "}
          <code className="font-mono">npm run dev</code>.
        </p>
      ) : null}
    </div>
  );
}
