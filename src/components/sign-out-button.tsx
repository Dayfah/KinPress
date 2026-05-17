"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, SUPABASE_ENV_SETUP_HINT } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  className?: string;
  label?: string;
};

export function SignOutButton({
  className,
  label = "Sign out",
}: SignOutButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  async function handleSignOut() {
    setMessage(null);

    const supabase = createClient();

    if (!supabase) {
      setMessage(SUPABASE_ENV_SETUP_HINT);
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <button
        className={cn("kp-btn-outline w-full sm:w-auto", className)}
        disabled={!configured}
        onClick={handleSignOut}
        type="button"
      >
        {label}
      </button>
      {message ? (
        <p className="max-w-md text-sm text-heritage" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
