"use client";

import { AuthProvider } from "@/components/auth/auth-provider";
import type { AuthProfile, ClientAuthUser } from "@/lib/auth/session";

type AuthShellProps = {
  children: React.ReactNode;
  initialUser: ClientAuthUser | null;
  initialProfile: AuthProfile | null;
};

export function AuthShell({
  children,
  initialUser,
  initialProfile,
}: AuthShellProps) {
  return (
    <AuthProvider initialProfile={initialProfile} initialUser={initialUser}>
      {children}
    </AuthProvider>
  );
}
