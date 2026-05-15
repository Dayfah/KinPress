import Link from "next/link";

import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="py-8">
      <AuthForm mode="login" />
      <p className="mt-6 text-center text-sm text-neutral-600">
        New to KinPress?{" "}
        <Link href="/signup" className="font-bold text-neutral-950">
          Create an account
        </Link>
      </p>
    </div>
  );
}
