"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SupabaseConfigNotice } from "@/components/supabase-config-notice";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl, isSupabaseConfigured } from "@/lib/supabase/env";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isSignup = mode === "signup";
  const configured = isSupabaseConfigured();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const supabase = createClient();

    if (!supabase) {
      return;
    }

    setPending(true);

    try {
      const result = isSignup
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: getAuthCallbackUrl(),
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        setMessage(result.error.message);
        return;
      }

      if (isSignup) {
        if (result.data.session) {
          await fetch("/api/auth/setup", { method: "POST" });
          router.push("/profile");
          router.refresh();
          return;
        }

        setMessage("Check your inbox to confirm your account, then log in.");
        return;
      }

      await fetch("/api/auth/setup", { method: "POST" });
      router.push("/profile");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setPending(false);
    }
  }

  if (!configured) {
    return (
      <div className="kp-form mx-auto w-full min-w-0 max-w-md rounded-2xl border-ink/20 bg-paper p-6 sm:p-8">
        <div className="min-w-0">
          <p className="kp-eyebrow">{isSignup ? "Create account" : "Welcome back"}</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-editorial text-foreground sm:text-4xl">
            {isSignup ? "Join KinPress" : "Log in to KinPress"}
          </h1>
        </div>
        <div className="mt-8 min-w-0">
          <SupabaseConfigNotice />
        </div>
      </div>
    );
  }

  return (
    <form
      className="kp-form mx-auto w-full min-w-0 max-w-md rounded-2xl border-ink/20 bg-paper p-6 sm:p-8"
      onSubmit={handleSubmit}
    >
      <div className="min-w-0">
        <p className="kp-eyebrow">{isSignup ? "Create account" : "Welcome back"}</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-editorial text-foreground sm:text-4xl">
          {isSignup ? "Join KinPress" : "Log in to KinPress"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          {isSignup
            ? "Create your reader profile to save stories and join the conversation."
            : "Continue to your saved stories, comments, and community profile."}
        </p>
      </div>
      <label className="kp-field mt-8 text-sm font-bold text-ink">
        Email
        <input
          autoComplete="email"
          className="kp-input mt-2 w-full min-w-0 rounded-xl outline-none focus:border-heritage"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="reader@example.com"
          required
          type="email"
          value={email}
        />
      </label>
      <label className="kp-field mt-5 text-sm font-bold text-ink">
        Password
        <input
          autoComplete={isSignup ? "new-password" : "current-password"}
          className="kp-input mt-2 w-full min-w-0 rounded-xl outline-none focus:border-heritage"
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          required
          type="password"
          value={password}
        />
      </label>
      <button
        className="kp-button mt-8 w-full min-w-0 justify-center text-center"
        disabled={pending}
        type="submit"
      >
        {pending ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
      </button>
      {message ? (
        <p
          className="mt-4 rounded-xl border border-ink/15 bg-card p-4 text-sm leading-6 text-ink/80"
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
