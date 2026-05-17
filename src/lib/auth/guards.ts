import { redirect } from "next/navigation";

import { ensureUserProfile } from "@/lib/auth/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileRole = {
  role: string | null;
};

export async function requireAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?error=supabase_config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await ensureUserProfile(supabase, user);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<ProfileRole>();

  return { supabase, user, profile };
}

export async function requireEditorOrAdmin() {
  const session = await requireAuthenticatedUser();
  const role = session.profile?.role ?? "reader";

  if (role !== "admin" && role !== "editor") {
    redirect("/");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireAuthenticatedUser();

  if (session.profile?.role !== "admin") {
    redirect("/");
  }

  return session;
}
