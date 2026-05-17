"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, SUPABASE_ENV_SETUP_HINT } from "@/lib/supabase/env";

export function SignOutButton() {
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
        className="kp-btn-outline w-full sm:w-auto"
        disabled={!configured}
        onClick={handleSignOut}
        type="button"
      >
        Log out
      </button>
      {message ? (
        <p className="max-w-md text-sm text-heritage" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
