import Link from "next/link";

import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen">
      <div className="kp-shell max-w-lg py-12 sm:py-16">
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-ink/70">
          New to KinPress?{" "}
          <Link className="font-bold text-heritage underline-offset-4 hover:underline" href="/signup">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
