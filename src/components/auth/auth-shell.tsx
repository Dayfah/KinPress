"use client";

import { AuthProvider } from "@/components/auth/auth-provider";
import type { AuthProfile } from "@/lib/auth/session";
import type { User } from "@supabase/supabase-js";

type AuthShellProps = {
  children: React.ReactNode;
  initialUser: User | null;
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
