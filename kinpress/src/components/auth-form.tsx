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

      setMessage(isSignup ? "Check your inbox to confirm your account." : "Welcome back.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">
          {isSignup ? "Create account" : "Welcome back"}
        </p>
        <h1 className="mt-3 text-3xl font-black text-neutral-950">
          {isSignup ? "Join KinPress" : "Log in to KinPress"}
        </h1>
      </div>
      <label className="mt-8 block text-sm font-semibold text-neutral-700">
        Email
        <input
          type="email"
          value={email}
          required
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-950"
          placeholder="reader@example.com"
        />
      </label>
      <label className="mt-5 block text-sm font-semibold text-neutral-700">
        Password
        <input
          type="password"
          value={password}
          required
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-950"
          placeholder="At least 6 characters"
        />
      </label>
      <button
        type="submit"
        className="mt-8 w-full rounded-2xl bg-neutral-950 px-5 py-3 font-bold text-white transition hover:bg-neutral-800"
      >
        {isSignup ? "Sign up" : "Log in"}
      </button>
      {message ? <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{message}</p> : null}
    </form>
  );
}
