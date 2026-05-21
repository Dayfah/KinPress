"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { KinPressLogo } from "@/components/kinpress-logo";
import { SupabaseConfigNotice } from "@/components/supabase-config-notice";
import { KINPRESS_DESCRIPTION } from "@/lib/brand";
import { mapSupabaseAuthError } from "@/lib/auth/messages";
import { sanitizeRedirectPath } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl, isSupabaseConfigured } from "@/lib/supabase/env";

type AuthFormProps = {
  mode: "login" | "signup";
  initialError?: string | null;
  redirectTo?: string;
};

export function AuthForm({ mode, initialError = null, redirectTo }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(initialError);
  const [pending, setPending] = useState(false);
  const isSignup = mode === "signup";
  const configured = isSupabaseConfigured();
  const afterAuthPath = sanitizeRedirectPath(redirectTo, "/profile");

  const authHeader = (
    <>
      <KinPressLogo className="mb-6" priority />
      <p className="kp-eyebrow">{isSignup ? "Create account" : "Welcome back"}</p>
      <h1 className="mt-3 font-serif text-3xl font-semibold tracking-editorial text-foreground sm:text-4xl">
        {isSignup ? "Join KinPress" : "Log in to KinPress"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{KINPRESS_DESCRIPTION}</p>
    </>
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const supabase = createClient();

    if (!supabase) {
      setMessage("Sign-in is not available right now. Please try again later.");
      return;
    }

    setPending(true);

    try {
      const result = isSignup
        ? await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              emailRedirectTo: getAuthCallbackUrl(),
            },
          })
        : await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

      if (result.error) {
        setMessage(mapSupabaseAuthError(result.error.message));
        return;
      }

      if (isSignup) {
        if (result.data.session) {
          await fetch("/api/auth/setup", { method: "POST" });
          router.push(afterAuthPath);
          router.refresh();
          return;
        }

        setMessage("Check your inbox to confirm your account, then log in.");
        return;
      }

      await fetch("/api/auth/setup", { method: "POST" });
      router.push(afterAuthPath);
      router.refresh();
    } catch (error) {
      setMessage(
        mapSupabaseAuthError(
          error instanceof Error ? error.message : "Something went wrong. Please try again.",
        ),
      );
    } finally {
      setPending(false);
    }
  }

  if (!configured) {
    return (
      <div className="kp-auth-card mx-auto w-full min-w-0 max-w-md">
        <div className="min-w-0">{authHeader}</div>
        <div className="mt-8 min-w-0">
          <SupabaseConfigNotice />
        </div>
      </div>
    );
  }

  return (
    <form className="kp-auth-card mx-auto w-full min-w-0 max-w-md" onSubmit={handleSubmit}>
      <div>{authHeader}</div>

      <label className="kp-field mt-8 block min-w-0 text-sm font-bold text-foreground">
        Email
        <input
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          className="kp-auth-input mt-2"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
      </label>

      <label className="kp-field mt-5 block min-w-0 text-sm font-bold text-foreground">
        Password
        <input
          autoComplete={isSignup ? "new-password" : "current-password"}
          className="kp-auth-input mt-2"
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          required
          type="password"
          value={password}
        />
      </label>

      <button
        className="kp-button mt-8 w-full min-w-0 justify-center text-center disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
      </button>

      {message ? (
        <p
          aria-live="polite"
          className="kp-auth-error mt-4"
          role="alert"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
