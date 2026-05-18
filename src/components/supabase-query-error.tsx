type SupabaseQueryErrorProps = {
  title?: string;
  message: string;
  hint?: string;
};

/** Visible banner when a Supabase query fails (shown to users, not only console). */
export function SupabaseQueryError({
  title = "Could not load stories",
  message,
  hint,
}: SupabaseQueryErrorProps) {
  return (
    <div
      className="rounded-2xl border border-heritage/35 bg-heritage/10 px-5 py-4 text-sm leading-6 text-foreground sm:px-6"
      role="alert"
    >
      <p className="text-xs font-black uppercase tracking-[0.18em] text-heritage">{title}</p>
      <p className="mt-2">{message}</p>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
