import { cache } from "react";

import { ensureUserProfile } from "@/lib/auth/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type AuthProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string | null;
  subscription_status: string | null;
};

export type ServerAuthSession = {
  user: User;
  profile: AuthProfile | null;
  isAdmin: boolean;
};

export const getServerAuthSession = cache(async function getServerAuthSession(): Promise<
  ServerAuthSession | null
> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  let { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, display_name, username, avatar_url, bio, role, subscription_status",
    )
    .eq("id", user.id)
    .maybeSingle<AuthProfile>();

  if (error) {
    console.error("[KinPress] getServerAuthSession profile load failed", error.message);
  }

  if (!profile) {
    const ensured = await ensureUserProfile(supabase, user);
    if (ensured) {
      const { data: refetched } = await supabase
        .from("profiles")
        .select(
          "id, display_name, username, avatar_url, bio, role, subscription_status",
        )
        .eq("id", user.id)
        .maybeSingle<AuthProfile>();
      profile = refetched ?? null;
    }
  }

  return {
    user,
    profile,
    isAdmin: profile?.role === "admin",
  };
});

export async function getProfileForUser(userId: string): Promise<AuthProfile | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, display_name, username, avatar_url, bio, role, subscription_status",
    )
    .eq("id", userId)
    .maybeSingle<AuthProfile>();

  if (error) {
    console.error("[KinPress] getProfileForUser failed", error.message);
    return null;
  }

  return data;
}
