"use client";

import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { AuthProfile, ClientAuthUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AuthContextValue = {
  user: ClientAuthUser | null;
  profile: AuthProfile | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  configured: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
  initialUser?: ClientAuthUser | null;
  initialProfile?: AuthProfile | null;
};

function toClientUser(user: User | null): ClientAuthUser | null {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
  };
}

async function fetchProfile(): Promise<AuthProfile | null> {
  const response = await fetch("/api/auth/profile", { cache: "no-store" });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { profile: AuthProfile | null };
  return data.profile ?? null;
}

export function AuthProvider({
  children,
  initialUser = null,
  initialProfile = null,
}: AuthProviderProps) {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<ClientAuthUser | null>(initialUser);
  const [profile, setProfile] = useState<AuthProfile | null>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);

  const syncProfile = useCallback(async (nextUser: ClientAuthUser | null) => {
    if (!nextUser) {
      setProfile(null);
      return;
    }

    const nextProfile = await fetchProfile();
    setProfile(nextProfile);
  }, []);

  const refresh = useCallback(async () => {
    if (!configured) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    if (!supabase) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const {
      data: { user: nextUser },
    } = await supabase.auth.getUser();

    setUser(toClientUser(nextUser));
    await syncProfile(toClientUser(nextUser));
    setIsLoading(false);
  }, [configured, syncProfile]);

  useEffect(() => {
    if (!configured) {
      return;
    }

    const supabase = createClient();

    if (!supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = toClientUser(session?.user ?? null);
      setUser(nextUser);
      void syncProfile(nextUser);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured, syncProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isLoading,
      isLoggedIn: Boolean(user),
      isAdmin: profile?.role === "admin",
      configured,
      refresh,
    }),
    [user, profile, isLoading, configured, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
