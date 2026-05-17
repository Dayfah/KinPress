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

import type { AuthProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AuthContextValue = {
  user: User | null;
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
  initialUser?: User | null;
  initialProfile?: AuthProfile | null;
};

async function fetchProfile(userId: string): Promise<AuthProfile | null> {
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
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<AuthProfile | null>(initialProfile);
  const [isLoading, setIsLoading] = useState(configured && !initialUser);

  const syncProfile = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setProfile(null);
      return;
    }

    const nextProfile = await fetchProfile(nextUser.id);
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

    setUser(nextUser ?? null);
    await syncProfile(nextUser ?? null);
    setIsLoading(false);
  }, [configured, syncProfile]);

  useEffect(() => {
    if (!configured) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    if (!supabase) {
      setIsLoading(false);
      return;
    }

    void refresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      void syncProfile(nextUser);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured, refresh, syncProfile]);

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
