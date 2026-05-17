import Link from "next/link";

import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden">
      <div className="kp-shell w-full max-w-lg py-12 sm:py-16">
        <AuthForm mode="signup" />
        <p className="mt-6 text-center text-sm text-ink/70">
          Already have an account?{" "}
          <Link className="font-bold text-heritage underline-offset-4 hover:underline break-words" href="/login">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
