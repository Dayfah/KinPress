import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { mapAuthPageError } from "@/lib/auth/messages";
import { sanitizeRedirectPath } from "@/lib/auth/routes";
import { getServerAuthSession } from "@/lib/auth/session";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
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
        <AuthForm initialError={initialError} mode="login" redirectTo={next} />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to KinPress?{" "}
          <Link
            className="font-bold text-heritage underline-offset-4 hover:underline"
            href={next === "/profile" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`}
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
