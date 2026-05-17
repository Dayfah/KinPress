import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { mapAuthPageError } from "@/lib/auth/messages";
import { sanitizeRedirectPath } from "@/lib/auth/routes";
import { getServerAuthSession } from "@/lib/auth/session";

type SignupPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const session = await getServerAuthSession();
  const next = sanitizeRedirectPath(params?.next, "/profile");

  if (session?.user) {
    redirect(next);
  }

  const initialError = mapAuthPageError(params?.error);

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden">
      <div className="kp-shell w-full max-w-lg py-12 sm:py-16">
        <AuthForm initialError={initialError} mode="signup" redirectTo={next} />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="font-bold text-heritage underline-offset-4 hover:underline"
            href={next === "/profile" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
