import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MastheadSession = {
  isLoggedIn: boolean;
  showAdmin: boolean;
};

export async function getMastheadSession(): Promise<MastheadSession> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { isLoggedIn: false, showAdmin: false };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isLoggedIn: false, showAdmin: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string | null }>();

  return {
    isLoggedIn: true,
    showAdmin: profile?.role === "admin",
  };
}
