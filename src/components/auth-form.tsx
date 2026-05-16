"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const isSignup = mode === "signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    try {
      const supabase = createClient();
      const result = isSignup
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        setMessage(result.error.message);
        return;
      }

      setMessage(
        isSignup
          ? "Check your inbox to confirm your account."
          : "Welcome back.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  return (
    <form className="kp-form mx-auto max-w-md rounded-2xl" onSubmit={handleSubmit}>
      <div>
        <p className="kp-eyebrow">{isSignup ? "Create account" : "Welcome back"}</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-editorial text-foreground sm:text-4xl">
          {isSignup ? "Join KinPress" : "Log in to KinPress"}
        </h1>
      </div>
      <label className="kp-field mt-8 text-sm font-bold text-ink">
        Email
        <input
          className="mt-2 w-full rounded-xl border border-ink/15 bg-bone px-4 py-3 text-ink outline-none focus:border-heritage"
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
          className="mt-2 w-full rounded-xl border border-ink/15 bg-bone px-4 py-3 text-ink outline-none focus:border-heritage"
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          required
          type="password"
          value={password}
        />
      </label>
      <button
        className="kp-button mt-8 w-full justify-center text-center"
        type="submit"
      >
        {isSignup ? "Sign up" : "Log in"}
      </button>
      {message ? (
        <p className="mt-4 rounded-xl border border-ink/15 bg-card p-4 text-sm text-ink/80">
          {message}
        </p>
      ) : null}
    </form>
  );
}
