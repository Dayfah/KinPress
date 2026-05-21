"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { AUTH_UNAVAILABLE_MESSAGE } from "@/lib/auth/messages";
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
  const auth = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  async function handleSignOut() {
    setMessage(null);

    const supabase = createClient();

    if (!supabase) {
      setMessage(AUTH_UNAVAILABLE_MESSAGE);
      return;
    }

    const { error } = await supabase.auth.signOut({ scope: "global" });

    if (error) {
      setMessage(error.message);
      return;
    }

    await auth.refresh();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <button
        className={cn("kp-auth-link-outline w-full sm:w-auto", className)}
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
