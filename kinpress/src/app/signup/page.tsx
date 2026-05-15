import Link from "next/link";

import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="py-8">
      <AuthForm mode="signup" />
      <p className="mt-6 text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-neutral-950">
          Log in
        </Link>
      </p>
    </div>
  );
}
